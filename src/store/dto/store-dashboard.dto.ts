import { IsEnum, IsString } from "class-validator";
import { TimeRangePreset } from "src/store-transaction/dto/query-store-transaction.dto";

export class StoreDashboardDto {
  @IsString()
  userId: string

  @IsEnum(TimeRangePreset)
  timeRangePreset: TimeRangePreset
}