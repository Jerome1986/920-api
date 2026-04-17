import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class WalletRepository {
  constructor(private prisma: PrismaService) { }

  // 批量获取用户钱包
  findByUserWallet(managerIds: string[]) {
    return this.prisma.wallet.findMany(
      { where: { userId: { in: managerIds } } }
    )
  }

  // 创建用户钱包
  createByUserWallet(userId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.wallet.create({
      data: {
        userId,
        balance: 0,
        availableBalance: 0,
        frozenBalance: 0
      }
    })
  }

  // 删除用户钱包
  deleteByUserWallet(userId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.wallet.delete({
      where: { userId }
    })
  }

  // 查询钱包
  findOne(userId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.wallet.findUnique({
      where: { userId }
    })
  }

  // 加用户钱包余额
  incrementBalance(userId: string, amount: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } }
    })
  }

  // 减用户钱包余额
  decrementBalance(userId: string, amount: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } }
    })
  }
}