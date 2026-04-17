import { Injectable } from "@nestjs/common";
import { CreateSettlementRecordDto, SettlementStatusDto } from "./dto/create-settlement-record.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";

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
    return db.settlementRecord.update({
      where: { orderId, status: 'PENDING' },
      data: { status }
    })
  }
}