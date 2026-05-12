import { Module } from '@nestjs/common';
import { SettlementRecordRepository } from './settlement-record.repository';
import { SettlementRecordController } from './settlement-record.controller';
import { SettlementRecordService } from './settlement-record.service';

@Module({
  controllers: [SettlementRecordController],
  providers: [SettlementRecordRepository, SettlementRecordService],
})
export class SettlementRecordModule { }
