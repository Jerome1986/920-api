import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { AgentInviteBenefitStatus, AgentStatus, Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { AgentInviteRepository } from './agent-invite.repository'
import { ClaimAgentInviteDto } from './dto/claim-agent-invite.dto'
import { QueryAgentInviteRecordsDto } from './dto/query-agent-invite-records.dto'

const AGENT_INVITE_REWARD_COUNT = 1
const AGENT_INVITE_VALIDITY_DAYS = 60

export enum AgentInviteClaimStatus {
  // 当前用户尚未领取，可以立即领取权益
  CLAIMABLE = 'CLAIMABLE',
  // 当前用户已领取，且权益仍在有效期内可使用
  CLAIMED_AVAILABLE = 'CLAIMED_AVAILABLE',
  // 当前用户已领取，但权益已经使用
  CLAIMED_USED = 'CLAIMED_USED',
  // 当前用户已领取，但权益已超过有效期
  CLAIMED_EXPIRED = 'CLAIMED_EXPIRED',
  // 当前用户就是发起邀请的代理本人，不能自己领取
  SELF_INVITE = 'SELF_INVITE',
  // 代理邀请不存在或代理已停用，当前邀请不可用
  AGENT_UNAVAILABLE = 'AGENT_UNAVAILABLE',
}

type AgentInviteClaim = NonNullable<
  Awaited<ReturnType<AgentInviteRepository['findClaimByUserId']>>
>

@Injectable()
export class AgentInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentInviteRepo: AgentInviteRepository,
  ) { }

  // 查询当前用户的代理邀请赠送权益，本函数只读取和计算状态，不修改数据库
  async findMyBenefit(userId: string) {
    // 1. 校验临时传入的用户 ID 对应真实注册用户
    const user = await this.agentInviteRepo.findUser(userId)
    if (!user) throw new BadRequestException('当前用户不存在')

    // 2. 查询用户全平台唯一的代理邀请领取记录，无记录时返回 null
    const claim = await this.agentInviteRepo.findClaimByUserId(userId)
    if (!claim) return null

    // 3. 根据服务端当前时间计算实时状态，不同步修改数据库状态
    const status = this.resolveBenefitStatus(claim.benefitStatus, claim.expiresAt)

    // 4. 组装代理赠送权益展示数据，仅有效且未使用的权益可用次数为 1
    return {
      claimId: claim.id,
      agentCode: claim.agent.agentCode,
      status,
      availableCount: status === AgentInviteBenefitStatus.AVAILABLE ? 1 : 0,
      claimedAt: claim.claimedAt,
      expiresAt: claim.expiresAt,
      usedAt: claim.usedAt,
    }
  }

  // 查询领取页状态，本函数只读取和计算状态，不新增或修改领取记录
  async landing(agentCode: string, userId: string) {
    // 1. 校验临时传入的用户 ID 对应真实注册用户
    const user = await this.agentInviteRepo.findUser(userId)
    if (!user) throw new BadRequestException('当前用户不存在')

    // 2. 查询代理；不存在或已停用时统一返回邀请不可用
    const agent = await this.agentInviteRepo.findAgentByCode(agentCode)
    if (!agent || agent.status !== AgentStatus.ACTIVE) {
      return this.buildLandingResult(agentCode, AgentInviteClaimStatus.AGENT_UNAVAILABLE)
    }

    // 3. 代理本人不能领取自己的邀请
    if (agent.userId === userId) {
      return this.buildLandingResult(agentCode, AgentInviteClaimStatus.SELF_INVITE)
    }

    // 4. 没有历史领取记录时返回可领取状态
    const claim = await this.agentInviteRepo.findClaimByUserId(userId)
    if (!claim) {
      return this.buildLandingResult(agentCode, AgentInviteClaimStatus.CLAIMABLE)
    }

    // 5. 已领取时根据权益状态和服务端当前时间计算页面展示状态
    return this.buildLandingResult(
      claim.agent.agentCode,
      this.resolveClaimStatus(claim.benefitStatus, claim.expiresAt),
      claim,
    )
  }

  // 确认领取代理邀请权益，并通过唯一约束保证重复或并发请求幂等
  async claim(claimAgentInviteDto: ClaimAgentInviteDto) {
    const { agentCode, userId } = claimAgentInviteDto

    // 1. 校验临时传入的用户 ID 对应真实注册用户
    const user = await this.agentInviteRepo.findUser(userId)
    if (!user) throw new BadRequestException('当前用户不存在')

    // 2. 用户已有领取记录时直接返回首次归因，不改变所属代理
    const claimed = await this.agentInviteRepo.findClaimByUserId(userId)
    if (claimed) return this.buildClaimResult('ALREADY_CLAIMED', claimed)

    try {
      // 3. 在同一事务内校验代理、再次检查领取记录并创建权益
      return await this.prisma.$transaction(async (tx) => {
        const agent = await this.agentInviteRepo.findAgentByCode(agentCode, tx)
        if (!agent) throw new NotFoundException('邀请信息不存在')
        if (agent.status !== AgentStatus.ACTIVE) {
          throw new ConflictException('当前邀请暂不可用')
        }
        if (agent.userId === userId) {
          throw new ConflictException('不能领取自己的邀请')
        }

        const existingClaim = await this.agentInviteRepo.findClaimByUserId(userId, tx)
        if (existingClaim) return this.buildClaimResult('ALREADY_CLAIMED', existingClaim)

        const claimedAt = new Date()
        const expiresAt = new Date(claimedAt)
        expiresAt.setUTCDate(expiresAt.getUTCDate() + AGENT_INVITE_VALIDITY_DAYS)

        const claim = await this.agentInviteRepo.createClaim(
          agent.id,
          userId,
          claimedAt,
          expiresAt,
          tx,
        )
        return this.buildClaimResult('GRANTED', claim)
      })
    } catch (error) {
      // 4. 并发创建触发唯一约束时，重新读取首次成功记录并按幂等成功返回
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existingClaim = await this.agentInviteRepo.findClaimByUserId(userId)
        if (existingClaim) return this.buildClaimResult('ALREADY_CLAIMED', existingClaim)
      }
      throw error
    }
  }

  // 组装领取页统一响应数据
  private buildLandingResult(
    agentCode: string,
    claimStatus: AgentInviteClaimStatus,
    claim?: AgentInviteClaim,
  ) {
    return {
      agentCode,
      claimStatus,
      rewardCount: AGENT_INVITE_REWARD_COUNT,
      validityDays: AGENT_INVITE_VALIDITY_DAYS,
      claim: claim
        ? {
          claimId: claim.id,
          claimedAt: claim.claimedAt,
          expiresAt: claim.expiresAt,
          benefitStatus: this.resolveBenefitStatus(claim.benefitStatus, claim.expiresAt),
        }
        : null,
    }
  }

  // 组装首次领取或重复领取的统一响应数据
  private buildClaimResult(result: 'GRANTED' | 'ALREADY_CLAIMED', claim: AgentInviteClaim) {
    return {
      result,
      claimId: claim.id,
      agentCode: claim.agent.agentCode,
      rewardCount: AGENT_INVITE_REWARD_COUNT,
      benefitStatus: this.resolveBenefitStatus(claim.benefitStatus, claim.expiresAt),
      claimedAt: claim.claimedAt,
      expiresAt: claim.expiresAt,
    }
  }

  // 根据数据库权益状态和到期时间计算领取页状态
  private resolveClaimStatus(status: AgentInviteBenefitStatus, expiresAt: Date) {
    if (status === AgentInviteBenefitStatus.USED) return AgentInviteClaimStatus.CLAIMED_USED
    if (status === AgentInviteBenefitStatus.EXPIRED || expiresAt <= new Date()) {
      return AgentInviteClaimStatus.CLAIMED_EXPIRED
    }
    return AgentInviteClaimStatus.CLAIMED_AVAILABLE
  }

  // 将已过期但尚未落库更新的 AVAILABLE 状态映射为 EXPIRED 返回前端
  private resolveBenefitStatus(status: AgentInviteBenefitStatus, expiresAt: Date) {
    if (status === AgentInviteBenefitStatus.AVAILABLE && expiresAt <= new Date()) {
      return AgentInviteBenefitStatus.EXPIRED
    }
    return status
  }

  // 根据用户手机号查询是否是某个代理的邀请
  async checkInviteByPhone(agentId: string, mobile: string) {
    const res = await this.agentInviteRepo.checkInviteByPhone(agentId, mobile)
    console.log('邀请返回', res)
    return { isInvite: res ? true : false }
  }

  // 根据代理agentId 查询邀请权益列表
  async findRecords(query: QueryAgentInviteRecordsDto) {
    const agent = await this.agentInviteRepo.findAgentByUserId(query.userId)
    if (!agent || agent.status !== AgentStatus.ACTIVE) {
      throw new ForbiddenException('暂无代理邀请记录查看权限')
    }

    const pageNum = query.pageNum ?? 1
    const pageSize = query.pageSize ?? 10
    const now = new Date()
    const [summary, [records, total], mobileMatched] = await Promise.all([
      this.agentInviteRepo.countRecordsByStatus(agent.id, now),
      this.agentInviteRepo.findRecords(
        agent.id,
        query.mobile,
        query.benefitStatus,
        pageNum,
        pageSize,
        now,
      ),
      query.mobile
        ? this.agentInviteRepo.hasRecordByMobile(agent.id, query.mobile)
        : Promise.resolve(null),
    ])

    return {
      agentCode: agent.agentCode,
      summary: {
        totalInvited:
          summary.availableCount + summary.usedCount + summary.expiredCount,
        ...summary,
      },
      list: records.map(record => ({
        claimId: record.id,
        mobile: this.maskMobile(record.invitee.mobile),
        claimedAt: record.claimedAt,
        expiresAt: record.expiresAt,
        benefitStatus: this.resolveBenefitStatus(record.benefitStatus, record.expiresAt),
        usedAt: record.usedAt,
      })),
      total,
      pageNum,
      pageSize,
      hasMore: pageNum * pageSize < total,
      mobileMatched,
    }
  }

  private maskMobile(mobile: string) {
    return `${mobile.slice(0, 3)}****${mobile.slice(-4)}`
  }
}
