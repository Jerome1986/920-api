import { Module } from '@nestjs/common';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletTransactionController } from './wallet-transaction.controller';
import { WallettransactionRepository } from './wallet-transaction.repository';

@Module({
  controllers: [WalletTransactionController],
  providers: [WalletTransactionService, WallettransactionRepository],
})
export class WalletTransactionModule { }
