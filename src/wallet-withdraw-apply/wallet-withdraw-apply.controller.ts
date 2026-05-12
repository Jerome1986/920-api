import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common'
import { WalletWithdrawApplyService } from './wallet-withdraw-apply.service'
import { CreateWalletWithdrawApplyDto } from './dto/create-wallet-withdraw-apply.dto'
import { QueryWalletWithdrawApplyDto } from './dto/query-wallet-withdraw-apply.dto'
import { RejectWalletWithdrawApplyDto } from './dto/reject-wallet-withdraw-apply.dto'
import { ApproveWalletWithdrawApplyDto } from './dto/approve-wallet-withdraw-apply.dto'

@Controller('wallet-withdraw-apply')
export class WalletWithdrawApplyController {
  constructor(private readonly walletWithdrawApplyService: WalletWithdrawApplyService) { }

  // 申请提现
  @Post('submit')
  async create(@Body() createWalletWithdrawApplyDto: CreateWalletWithdrawApplyDto) {
    return this.walletWithdrawApplyService.create(createWalletWithdrawApplyDto)
  }

  // 获取所有的提现记录
  @Get()
  async findAll(@Query() queryWalletWithdrawApplyDto: QueryWalletWithdrawApplyDto) {
    return this.walletWithdrawApplyService.findAll(queryWalletWithdrawApplyDto)
  }

  // 获取详情
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    return this.walletWithdrawApplyService.findOne(+id)
  }

  // 拒绝提现申请
  @Patch('reject/:id')
  async rejectOne(@Param('id') id: string, @Body() rejectWalletWithdrawApplyDto: RejectWalletWithdrawApplyDto) {
    return this.walletWithdrawApplyService.rejectOne(+id, rejectWalletWithdrawApplyDto)
  }

  // 通过提现申请
  @Patch('approve/:id')
  async approveOne(@Param('id') id: string, @Body() approveWalletWithdrawApplyDto: ApproveWalletWithdrawApplyDto) {
    return this.walletWithdrawApplyService.approveOne(+id, approveWalletWithdrawApplyDto)
  }
}
