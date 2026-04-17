import { Module } from '@nestjs/common';
import { SettlementRecordRepository } from './settlement-record.repository';

@Module({
  controllers: [],
  providers: [SettlementRecordRepository],
})
export class SettlementRecordModule { }
