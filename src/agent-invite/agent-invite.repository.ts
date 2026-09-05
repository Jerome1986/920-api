import { Injectable } from '@nestjs/common'
import { AgentInviteBenefitStatus, Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AgentInviteRepository {
  constructor(private readonly prisma: PrismaService) { }

  // 根据用户 ID 查询注册用户，用于临时用户身份校验
  findUser(userId: string, tx?: Prisma.TransactionClient) {
    // 1. 事务存在时使用事务客户端，否则使用全局 Prisma 客户端
    const db = tx ?? this.prisma
    return db.user.findUnique({ where: { id: userId }, select: { id: true } })
  }

  // 根据代理邀请码查询代理资格
  findAgentByCode(agentCode: string, tx?: Prisma.TransactionClient) {
    // 1. 返回领取校验所需的代理 ID、用户 ID 和状态
    const db = tx ?? this.prisma
    return db.agentProfile.findUnique({
      where: { agentCode },
      select: { id: true, userId: true, agentCode: true, status: true },
    })
  }

  // 根据被邀请用户查询其全平台唯一的首次领取记录
  findClaimByUserId(userId: string, tx?: Prisma.TransactionClient) {
    // 1. 同时关联首次归因代理的邀请码，确保重复领取返回真实归因
    const db = tx ?? this.prisma
    return db.agentInviteClaim.findUnique({
      where: { inviteeUserId: userId },
      include: { agent: { select: { agentCode: true } } },
    })
  }

  // 查询用户当前未过期且尚未使用的代理邀请权益
  findAvailableClaimByUserId(userId: string, now: Date, tx?: Prisma.TransactionClient) {
    // 1. 同时返回归因代理邀请码，供权益查询和订单展示使用
    const db = tx ?? this.prisma
    return db.agentInviteClaim.findFirst({
      where: {
        inviteeUserId: userId,
        benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
        expiresAt: { gt: now },
      },
      include: { agent: { select: { agentCode: true } } },
    })
  }

  // 条件占用代理邀请权益，防止并发订单重复使用
  useClaim(claimId: string, now: Date, tx: Prisma.TransactionClient) {
    // 1. 只有仍可用且未过期的记录才能更新为已使用
    return tx.agentInviteClaim.updateMany({
      where: {
        id: claimId,
        benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
        expiresAt: { gt: now },
      },
      data: {
        benefitStatus: AgentInviteBenefitStatus.USED,
        usedAt: now,
      },
    })
  }

  // 取消订单时按当前到期时间原路恢复代理邀请权益
  async restoreClaim(claimId: string, now: Date, tx: Prisma.TransactionClient) {
    // 1. 查询到期时间，用于决定恢复为可用还是标记为过期
    const claim = await tx.agentInviteClaim.findUnique({
      where: { id: claimId },
      select: { expiresAt: true },
    })
    if (!claim) return { count: 0 }

    // 2. 仅允许恢复已使用权益，避免重复取消重复返还
    return tx.agentInviteClaim.updateMany({
      where: { id: claimId, benefitStatus: AgentInviteBenefitStatus.USED },
      data: {
        benefitStatus: claim.expiresAt > now
          ? AgentInviteBenefitStatus.AVAILABLE
          : AgentInviteBenefitStatus.EXPIRED,
        usedAt: null,
      },
    })
  }

  // 创建代理邀请领取记录并关联用户与代理
  createClaim(
    agentId: string,
    inviteeUserId: string,
    claimedAt: Date,
    expiresAt: Date,
    tx: Prisma.TransactionClient,
  ) {
    // 1. 领取时间、到期时间和权益状态全部由服务端写入
    return tx.agentInviteClaim.create({
      data: {
        agentId,
        inviteeUserId,
        claimedAt,
        expiresAt,
        benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
      },
      include: { agent: { select: { agentCode: true } } },
    })
  }

  // 根据用户手机号查询是否是某个代理的邀请
  checkInviteByPhone(agentId: string, mobile: string) {
    return this.prisma.agentInviteClaim.findFirst({
      where: {
        agentId,
        invitee: {
          mobile
        }
      },
    })
  }

  // 根据用户 ID 查询其代理资料，邀请记录接口只允许启用中的代理访问
  findAgentByUserId(userId: string) {
    return this.prisma.agentProfile.findUnique({
      where: { userId },
      select: { id: true, agentCode: true, status: true },
    })
  }

  // 当前代理全部领取记录的实时状态统计
  async countRecordsByStatus(agentId: string, now: Date) {
    const [availableCount, usedCount, expiredCount] = await this.prisma.$transaction([
      this.prisma.agentInviteClaim.count({
        where: { agentId, ...this.buildStatusWhere(AgentInviteBenefitStatus.AVAILABLE, now) },
      }),
      this.prisma.agentInviteClaim.count({
        where: { agentId, ...this.buildStatusWhere(AgentInviteBenefitStatus.USED, now) },
      }),
      this.prisma.agentInviteClaim.count({
        where: { agentId, ...this.buildStatusWhere(AgentInviteBenefitStatus.EXPIRED, now) },
      }),
    ])

    return { availableCount, usedCount, expiredCount }
  }

  // 按手机号、实时权益状态及分页条件查询当前代理的领取记录
  async findRecords(
    agentId: string,
    mobile: string | undefined,
    benefitStatus: AgentInviteBenefitStatus | undefined,
    pageNum: number,
    pageSize: number,
    now: Date,
  ) {
    const where: Prisma.AgentInviteClaimWhereInput = {
      agentId,
      ...this.buildMobileWhere(mobile),
      ...(benefitStatus ? this.buildStatusWhere(benefitStatus, now) : {}),
    }

    return this.prisma.$transaction([
      this.prisma.agentInviteClaim.findMany({
        where,
        select: {
          id: true,
          claimedAt: true,
          expiresAt: true,
          benefitStatus: true,
          usedAt: true,
          invitee: { select: { mobile: true } },
        },
        orderBy: [{ claimedAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.agentInviteClaim.count({ where }),
    ])
  }

  // 手机号是否存在于当前代理的全部领取记录中，不受状态和分页影响
  async hasRecordByMobile(agentId: string, mobile: string) {
    const count = await this.prisma.agentInviteClaim.count({
      where: { agentId, ...this.buildMobileWhere(mobile) },
    })
    return count > 0
  }

  private buildMobileWhere(mobile?: string): Prisma.AgentInviteClaimWhereInput {
    if (!mobile) return {}
    return {
      invitee: {
        mobile: mobile.length === 11 ? mobile : { endsWith: mobile },
      },
    }
  }

  private buildStatusWhere(
    benefitStatus: AgentInviteBenefitStatus,
    now: Date,
  ): Prisma.AgentInviteClaimWhereInput {
    if (benefitStatus === AgentInviteBenefitStatus.USED) {
      return { benefitStatus: AgentInviteBenefitStatus.USED }
    }
    if (benefitStatus === AgentInviteBenefitStatus.AVAILABLE) {
      return {
        benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
        expiresAt: { gt: now },
      }
    }
    return {
      OR: [
        { benefitStatus: AgentInviteBenefitStatus.EXPIRED },
        {
          benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
          expiresAt: { lte: now },
        },
      ],
    }
  }
}
