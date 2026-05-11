import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { WalletWithdrawApplyService } from './wallet-withdraw-apply.service'
import { CreateWalletWithdrawApplyDto } from './dto/create-wallet-withdraw-apply.dto'

@Controller('wallet-withdraw-apply')
export class WalletWithdrawApplyController {
  constructor(private readonly walletWithdrawApplyService: WalletWithdrawApplyService) { }

  // 申请提现
  @Post('submit')
  create(@Body() createWalletWithdrawApplyDto: CreateWalletWithdrawApplyDto) {
    return this.walletWithdrawApplyService.create(createWalletWithdrawApplyDto)
  }
}
