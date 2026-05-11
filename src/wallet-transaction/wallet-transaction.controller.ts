import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { WalletTransactionService } from './wallet-transaction.service'
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto'
import { QueryWalletTransactionDto } from './dto/query-wallet-transaction.dto'

@Controller('wallet-transaction')
export class WalletTransactionController {
  constructor(private readonly walletTransactionService: WalletTransactionService) { }

  // 创建钱包流水
  @Post()
  async create(@Body() createWalletTransactionDto: CreateWalletTransactionDto) {
    return this.walletTransactionService.create(createWalletTransactionDto)
  }

  // 获取个人钱包交易记录
  @Get('transaction/:userId')
  async findByUser(@Param('userId') userId: string, @Query() query: QueryWalletTransactionDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    const tab = query.tab || "ALL"

    return this.walletTransactionService.findByUser(userId, tab, pageNum, pageSize)
  }
}
