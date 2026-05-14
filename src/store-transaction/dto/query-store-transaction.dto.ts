import { IsEnum, IsOptional, IsString } from "class-validator"

export enum TimeRangePreset {
  today = "today",
  month = "month",
  year = "year"
}

export enum StoreTransactionFilterType {
  ALL = "ALL",
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}

export class QueryStoreTransactionDto {
  @IsOptional()
  @IsEnum(StoreTransactionFilterType)
  filterType?: StoreTransactionFilterType

  @IsOptional()
  @IsEnum(TimeRangePreset)
  timeRangePreset?: TimeRangePreset

  @IsString()
  pageNum: string

  @IsString()
  pageSize: string
}
