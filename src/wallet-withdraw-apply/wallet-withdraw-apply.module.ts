import { Module } from '@nestjs/common';
import { WalletWithdrawApplyService } from './wallet-withdraw-apply.service';
import { WalletWithdrawApplyController } from './wallet-withdraw-apply.controller';
import { WalletWithdrawApplyRepositroy } from './wallet-withdraw-apply.repository';
import { WalletRepository } from 'src/wallet/wallet.repository';

@Module({
  controllers: [WalletWithdrawApplyController],
  providers: [
    WalletWithdrawApplyService,
    WalletWithdrawApplyRepositroy,
    WalletRepository
  ],
})
export class WalletWithdrawApplyModule { }
