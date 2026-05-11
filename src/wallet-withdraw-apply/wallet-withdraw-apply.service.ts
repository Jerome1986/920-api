import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWalletWithdrawApplyDto } from './dto/create-wallet-withdraw-apply.dto';
import { UpdateWalletWithdrawApplyDto } from './dto/update-wallet-withdraw-apply.dto';
import { WalletWithdrawApplyRepositroy } from './wallet-withdraw-apply.repository';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletWithdrawApplyService {
  constructor(
    private prisma: PrismaService,
    private repo: WalletWithdrawApplyRepositroy,
    private walletRepo: WalletRepository
  ) { }

  // 申请提现
  async create(createWalletWithdrawApplyDto: CreateWalletWithdrawApplyDto) {
    try {
      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.钱包校验
        // 1.1 获取用户钱包
        const userId = createWalletWithdrawApplyDto.userId
        const userWallet = await this.walletRepo.findOne(userId, tx)
        if (!userWallet) throw new BadRequestException('个人钱包错误')
        // 1.2 验证参数
        const amount = createWalletWithdrawApplyDto.amount
        if (amount > Number(userWallet.availableBalance)) throw new BadRequestException('提现金额错误')

        // 2.钱包变动
        const updateResult = await this.walletRepo.applyAmountChange(userId, amount, tx)
        if (updateResult.count !== 1) throw new BadRequestException('提现金额错误')

        // 3.创建提现记录
        const withdrawReport = await this.repo.create(createWalletWithdrawApplyDto, tx)

        return withdrawReport
      })

      return result
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException('提现申请失败')
    }
  }
}
