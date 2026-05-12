import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service"
import { CreateWalletWithdrawApplyDto } from "./dto/create-wallet-withdraw-apply.dto";
import { Prisma, WithdrawStatus } from "@prisma/client";
import { QueryWithdrawStatus } from "./dto/query-wallet-withdraw-apply.dto";

@Injectable()
export class WalletWithdrawApplyRepositroy {
  constructor(private prisma: PrismaService) { }

  // 申请提现
  create(createWalletWithdrawApplyDto: CreateWalletWithdrawApplyDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.walletWithdrawApply.create({ data: createWalletWithdrawApplyDto })
  }

  // 获取所有的提现记录
  findAll(
    status: QueryWithdrawStatus,
    pageNum: number,
    pageSize: number,
    keyword: string,
    createdStartAt?: string,
    createdEndAt?: string
  ) {
    const where: Prisma.WalletWithdrawApplyWhereInput = {}

    if (status !== QueryWithdrawStatus.ALL) where.status = status as WithdrawStatus
    if (keyword) {
      where.OR = [
        { withdrawNo: { contains: keyword } },
        { userId: { contains: keyword } },
        { payeeName: { contains: keyword } },
        { payeeAccount: { contains: keyword } },
        { bankName: { contains: keyword } }
      ]
    }
    if (createdStartAt || createdEndAt) {
      where.createdAt = {}
      if (createdStartAt) where.createdAt.gte = new Date(createdStartAt)
      if (createdEndAt) where.createdAt.lte = new Date(createdEndAt)
    }

    return Promise.all([
      this.prisma.walletWithdrawApply.findMany({
        where,
        include: { user: true },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.walletWithdrawApply.count({ where })
    ])
  }

  // 获取提现详情
  findOne(id: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.walletWithdrawApply.findUnique({
      where: { id },
      include: { user: true }
    })
  }

  // 拒绝提现申请
  rejectOne(id: number, reviewerId?: number, rejectReason?: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.walletWithdrawApply.updateMany({
      where: { id, status: "APPLYING" },
      data: {
        status: "REJECTED",
        reviewerId,
        rejectReason,
        reviewedAt: new Date()
      }
    })
  }

  // 通过提现申请
  approveOne(id: number, reviewerId?: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.walletWithdrawApply.updateMany({
      where: { id, status: "APPLYING" },
      data: {
        status: "PAID",
        reviewerId,
        reviewedAt: new Date(),
        paidAt: new Date()
      }
    })
  }
}
