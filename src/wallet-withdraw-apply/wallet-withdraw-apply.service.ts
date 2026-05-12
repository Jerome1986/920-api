import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWalletWithdrawApplyDto } from './dto/create-wallet-withdraw-apply.dto';
import { WalletWithdrawApplyRepositroy } from './wallet-withdraw-apply.repository';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryWalletWithdrawApplyDto, QueryWithdrawStatus } from './dto/query-wallet-withdraw-apply.dto';
import { RejectWalletWithdrawApplyDto } from './dto/reject-wallet-withdraw-apply.dto';
import { ApproveWalletWithdrawApplyDto } from './dto/approve-wallet-withdraw-apply.dto';
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository';
import { WalletBizTypeDto, WalletTransactionTypeDto } from 'src/wallet-transaction/dto/create-wallet-transaction.dto';

@Injectable()
export class WalletWithdrawApplyService {
  constructor(
    private prisma: PrismaService,
    private repo: WalletWithdrawApplyRepositroy,
    private walletRepo: WalletRepository,
    private wallettransactionRepo: WallettransactionRepository
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

  // 获取所有的提现记录
  async findAll(queryWalletWithdrawApplyDto: QueryWalletWithdrawApplyDto) {
    const status = queryWalletWithdrawApplyDto.status || QueryWithdrawStatus.ALL
    const pageNum = Number(queryWalletWithdrawApplyDto.pageNum) || 1
    const pageSize = Number(queryWalletWithdrawApplyDto.pageSize) || 10
    const keyword = queryWalletWithdrawApplyDto.keyword || ''
    const createdStartAt = queryWalletWithdrawApplyDto.createdStartAt
    const createdEndAt = queryWalletWithdrawApplyDto.createdEndAt

    const [list, total] = await this.repo.findAll(status, pageNum, pageSize, keyword, createdStartAt, createdEndAt)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 获取提现详情
  async findOne(id: number) {
    if (!id) throw new BadRequestException('提现申请ID错误')

    const detail = await this.repo.findOne(id)
    if (!detail) throw new BadRequestException('提现申请不存在')

    return detail
  }

  // 拒绝提现申请
  async rejectOne(id: number, rejectWalletWithdrawApplyDto: RejectWalletWithdrawApplyDto = {}) {
    if (!id) throw new BadRequestException('提现申请ID错误')

    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.获取提现申请详情
        const detail = await this.repo.findOne(id, tx)
        if (!detail) throw new BadRequestException('提现申请不存在')

        // 2.校验提现申请状态
        if (detail.status !== 'APPLYING') throw new BadRequestException('当前提现申请不可拒绝')

        // 3.更新提现申请为已拒绝
        const rejectResult = await this.repo.rejectOne(
          id,
          rejectWalletWithdrawApplyDto.reviewerId,
          rejectWalletWithdrawApplyDto.rejectReason,
          tx
        )
        if (rejectResult.count !== 1) throw new BadRequestException('拒绝提现申请失败')

        // 4.回退钱包冻结金额到可用余额
        const walletResult = await this.walletRepo.rejectWithdrawAmountChange(
          detail.userId,
          Number(detail.amount),
          tx
        )
        if (walletResult.count !== 1) throw new BadRequestException('提现冻结金额错误')

        // 5.返回最新提现申请详情
        return this.repo.findOne(id, tx)
      })
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException('拒绝提现申请失败')
    }
  }

  // 通过提现申请
  async approveOne(id: number, approveWalletWithdrawApplyDto: ApproveWalletWithdrawApplyDto = {}) {
    if (!id) throw new BadRequestException('提现申请ID错误')

    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.获取提现申请详情
        const detail = await this.repo.findOne(id, tx)
        if (!detail) throw new BadRequestException('提现申请不存在')

        // 2.校验提现申请状态
        if (detail.status !== 'APPLYING') throw new BadRequestException('当前提现申请不可通过')

        // 3.更新提现申请为已打款
        const approveResult = await this.repo.approveOne(
          id,
          approveWalletWithdrawApplyDto.reviewerId,
          tx
        )
        if (approveResult.count !== 1) throw new BadRequestException('通过提现申请失败')

        // 4.扣减钱包冻结金额和总余额
        const walletResult = await this.walletRepo.approveWithdrawAmountChange(
          detail.userId,
          Number(detail.amount),
          tx
        )
        if (walletResult.count !== 1) throw new BadRequestException('提现冻结金额错误')

        // 5.查询扣款后的钱包余额
        const wallet = await this.walletRepo.findOne(detail.userId, tx)
        if (!wallet) throw new BadRequestException('个人钱包错误')

        // 6.新增提现钱包流水
        await this.wallettransactionRepo.create({
          userId: detail.userId,
          type: WalletTransactionTypeDto.OUT,
          bizType: WalletBizTypeDto.WITHDRAW,
          amount: Number(detail.amount),
          balanceAfter: Number(wallet.balance),
          relatedId: detail.id,
          remark: '提现支出'
        }, tx)

        // 7.TODO: 支付接口待定，后续在这里接入外部打款流程

        // 8.返回最新提现申请详情
        return this.repo.findOne(id, tx)
      })
    } catch (error) {
      console.error(error)
      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException('通过提现申请失败')
    }
  }
}
