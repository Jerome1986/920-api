import { Injectable } from "@nestjs/common";
import { CreateSettlementRecordDto, SettlementStatusDto } from "./dto/create-settlement-record.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { QuerySettlementStatus } from "./dto/query-settlement-record.dto";

@Injectable()
export class SettlementRecordRepository {
  constructor(private prisma: PrismaService) { }

  // 创建结算表--分钱记录
  create(createSettlementRecordDto: CreateSettlementRecordDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.settlementRecord.create({ data: createSettlementRecordDto })
  }

  // 查询结算
  findOne(orderId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.settlementRecord.findUnique({
      where: { orderId }
    })
  }

  // 更新结算表流水状态
  updateStatus(orderId: string, status: SettlementStatusDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    let data: any = {
      status
    }

    if (status === 'SETTLED') {
      data.settledAt = new Date()
    }

    return db.settlementRecord.update({
      where: { orderId },
      data
    })
  }

  // 获取所有的结算列表
  async findAll(
    status: QuerySettlementStatus,
    pageNum: number,
    pageSize: number,
    keyword: string,
    createdStartAt?: string,
    createdEndAt?: string
  ) {
    let where: any = {}
    if (status !== QuerySettlementStatus.ALL) where.status = status
    if (keyword) where.OR = [
      { storeId: keyword },
      { managerId: keyword },
      { orderId: { contains: keyword } }
    ]
    if (createdStartAt || createdEndAt) {
      where.createdAt = {}
      if (createdStartAt) where.createdAt.gte = new Date(createdStartAt)
      if (createdEndAt) where.createdAt.lte = new Date(createdEndAt)
    }

    const [list, total] = await Promise.all([
      this.prisma.settlementRecord.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.settlementRecord.count({ where })
    ])

    // 提取当前页店长ID，避免逐条查询用户表
    const managerIds = [...new Set(list.map(item => item.managerId))]
    // 批量查询店长手机号，用于前端列表展示
    const managers = managerIds.length
      ? await this.prisma.user.findMany({
        where: { id: { in: managerIds } },
        select: { id: true, mobile: true }
      })
      : []
    const managerPhoneMap = new Map(managers.map(manager => [manager.id, manager.mobile]))

    // 合并店长手机号；未找到用户时返回null
    const listWithManagerPhone = list.map(item => ({
      ...item,
      managerPhone: managerPhoneMap.get(item.managerId) ?? null
    }))

    return [
      listWithManagerPhone,
      total
    ] as const
  }
}
