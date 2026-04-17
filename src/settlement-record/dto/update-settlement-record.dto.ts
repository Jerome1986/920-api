import { PartialType } from '@nestjs/mapped-types';
import { CreateSettlementRecordDto } from './create-settlement-record.dto';

export class UpdateSettlementRecordDto extends PartialType(CreateSettlementRecordDto) {}
