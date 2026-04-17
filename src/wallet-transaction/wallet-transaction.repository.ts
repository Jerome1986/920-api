import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWalletTransactionDto } from "./dto/create-wallet-transaction.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class WallettransactionRepository {
  constructor(private prisma: PrismaService) { }

  // 创建钱包流水
  create(createWalletTransactionDto: CreateWalletTransactionDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.walletTransaction.create({ data: createWalletTransactionDto })
  }
}