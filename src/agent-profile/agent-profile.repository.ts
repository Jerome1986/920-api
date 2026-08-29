import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateAgentProfileDto } from "./dto/create-agent-profile.dto";
import { AgentStatus, Prisma } from "@prisma/client";
import { QueryAgentStatus } from "./dto/query-agent-profile.dto";

@Injectable()
export class AgentProfileRepository {
  constructor(
    private prisma: PrismaService
  ) { }

  // 设定某个用户为代理人
  setAgent(createAgentProfileDto: CreateAgentProfileDto, agentCode: string, agentCodeUrl: string) {
    return this.prisma.agentProfile.create({
      data: {
        userId: createAgentProfileDto.userId,
        agentCode,
        agentCodeUrl,
        remark: createAgentProfileDto.remark || ''
      }
    })
  }

  // 根据用户 ID 查询代理资格，用于防止重复开通
  findByUserId(userId: string) {
    return this.prisma.agentProfile.findUnique({ where: { userId } })
  }

  // 根据代理资格记录 ID 查询详情
  findOne(id: string) {
    return this.prisma.agentProfile.findUnique({ where: { id } })
  }

  // 停用代理资格，保留原邀请码和二维码
  disable(id: string, operatorId?: number, disabledReason?: string) {
    return this.prisma.agentProfile.update({
      where: { id },
      data: {
        status: AgentStatus.DISABLED,
        disabledBy: operatorId,
        disabledAt: new Date(),
        disabledReason: disabledReason ?? null,
      },
    })
  }

  // 启用代理资格，必要时同时补全二维码链接
  enable(id: string, agentCodeUrl?: string) {
    return this.prisma.agentProfile.update({
      where: { id },
      data: {
        status: AgentStatus.ACTIVE,
        disabledBy: null,
        disabledAt: null,
        disabledReason: null,
        ...(agentCodeUrl ? { agentCodeUrl } : {}),
      },
    })
  }

  // 后台获取所有代理信息
  findAll(
    pageNum: number,
    pageSize: number,
    status: QueryAgentStatus,
    keyword: string,
    openedStartAt?: string,
    openedEndAt?: string,
  ) {
    // 1. 初始化 Prisma 查询条件
    const where: Prisma.AgentProfileWhereInput = {}

    // 2. 按代理状态筛选，ALL 表示不限制状态
    if (status !== QueryAgentStatus.ALL) where.status = status as AgentStatus

    // 3. 按关键词模糊搜索用户 ID、代理码、备注、用户昵称或手机号
    if (keyword) {
      where.OR = [
        { userId: { contains: keyword } },
        { agentCode: { contains: keyword } },
        { remark: { contains: keyword } },
        { user: { is: { nickname: { contains: keyword } } } },
        { user: { is: { mobile: { contains: keyword } } } },
      ]
    }

    // 4. 按代理开通时间范围筛选，开始和结束时间均可单独使用
    if (openedStartAt || openedEndAt) {
      where.openedAt = {}
      if (openedStartAt) where.openedAt.gte = new Date(openedStartAt)
      if (openedEndAt) where.openedAt.lte = new Date(openedEndAt)
    }

    // 5. 并行查询当前页列表和总记录数，减少整体等待时间
    return Promise.all([
      this.prisma.agentProfile.findMany({
        where,
        // 仅返回后台列表展示所需的代理和用户字段
        select: {
          id: true, userId: true, agentCode: true, agentCodeUrl: true, status: true,
          openedBy: true, openedAt: true, disabledBy: true, disabledAt: true,
          disabledReason: true, remark: true, createdAt: true, updatedAt: true,
          user: {
            select: {
              id: true, nickname: true, avatarUrl: true,
              mobile: true, role: true, status: true,
            },
          },
        },
        // 根据页码计算偏移量，并限制本页返回数量
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        // 最新创建的代理信息优先展示
        orderBy: { createdAt: 'desc' },
      }),
      // 使用相同筛选条件统计总数，用于计算总页数
      this.prisma.agentProfile.count({ where }),
    ])
  }
}
