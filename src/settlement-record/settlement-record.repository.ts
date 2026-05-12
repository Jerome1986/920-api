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
  findAll(
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

    return Promise.all([
      this.prisma.settlementRecord.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.settlementRecord.count({ where })
    ])
  }
}
