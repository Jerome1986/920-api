import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateCommissionRuleDto } from "./dto/update-commission-rule.dto";
import { CreateCommissionRecordDto } from "./dto/create-commission-rule.dto";
import { CommissionStatus, Prisma } from "@prisma/client";

@Injectable()
export class CommissionRuleRepository {
  constructor(private prisma: PrismaService) { }

  // 获取佣金规则
  findAll(tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.commissionRule.findMany()
  }

  // 获取用户佣金明细
  async findOneByUser(userId: string, pageNum: number, pageSize: number) {
    return await Promise.all([
      this.prisma.commissionRecord.findMany({
        where: { userId, status: 'SETTLED' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.commissionRecord.count({ where: { userId, status: 'SETTLED' } })
    ])
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
      where: { relatedId },
      data: { status }
    })
  }
}