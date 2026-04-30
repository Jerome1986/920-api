import { Module } from '@nestjs/common';
import { StoreTransactionRepository } from './store-transaction.repository';
import { StoreTransactionController } from './store-transaction.controller';
import { StoreTransactionService } from './store-transaction.service';

@Module({
  controllers: [StoreTransactionController],
  providers: [StoreTransactionRepository, StoreTransactionService]
})
export class StoreTransactionModule { }
