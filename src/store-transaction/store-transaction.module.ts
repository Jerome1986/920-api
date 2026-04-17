import { Module } from '@nestjs/common';
import { StoreTransactionRepository } from './store-transaction.repository';

@Module({
  controllers: [],
  providers: [StoreTransactionRepository]
})
export class StoreTransactionModule { }
