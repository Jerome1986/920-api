import { Module } from '@nestjs/common';
import { WalletWithdrawApplyService } from './wallet-withdraw-apply.service';
import { WalletWithdrawApplyController } from './wallet-withdraw-apply.controller';
import { WalletWithdrawApplyRepositroy } from './wallet-withdraw-apply.repository';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository';

@Module({
  controllers: [WalletWithdrawApplyController],
  providers: [
    WalletWithdrawApplyService,
    WalletWithdrawApplyRepositroy,
    WalletRepository,
    WallettransactionRepository
  ],
})
export class WalletWithdrawApplyModule { }
