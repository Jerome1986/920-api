import { PrismaService } from "src/prisma/prisma.service"
import { CreateWalletWithdrawApplyDto } from "./dto/create-wallet-withdraw-apply.dto";
import { Prisma } from "@prisma/client";

export class WalletWithdrawApplyRepositroy {
  constructor(private prisma: PrismaService) { }

  // 申请提现
  create(createWalletWithdrawApplyDto: CreateWalletWithdrawApplyDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.walletWithdrawApply.create({ data: createWalletWithdrawApplyDto })
  }
}