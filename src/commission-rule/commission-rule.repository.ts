import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateCommissionRuleDto } from "./dto/update-commission-rule.dto";
import { CreateCommissionRecordDto } from "./dto/create-commission-rule.dto";
import { CommissionStatus, Prisma } from "@prisma/client";

@Injectable()
export class CommissionRuleRepository {
  constructor(private prisma: PrismaService) { }

  // 获取佣金规则
  findAll() {
    return this.prisma.commissionRule.findMany()
  }

  // 更新佣金规则
  update(id: number, updateCommissionRuleDto: UpdateCommissionRuleDto) {
    return this.prisma.commissionRule.update({
      where: { id },
      data: updateCommissionRuleDto
    })
  }

  // 设置总佣金
  setTotalRate(id: number, totalRate: string) {
    return this.prisma.commissionRule.update({
      where: { id },
      data: { totalRate }
    })
  }

  // 创建佣金流水记录
  createCommissionRecord(createCommissionRecordDto: CreateCommissionRecordDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.commissionRecord.create({ data: createCommissionRecordDto })
  }

  // 查询佣金流水记录
  findCommissionRecord(relatedId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.commissionRecord.findMany({
      where: { relatedId, status: 'PENDING' }
    })
  }

  // 更新佣金流水状态
  updateCommissionRecordByStatus(relatedId: string, status: CommissionStatus, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.commissionRecord.updateMany({
      where: { relatedId, status: 'PENDING' },
      data: { status }
    })
  }
}