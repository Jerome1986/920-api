import { IsEnum, IsString } from "class-validator"

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
  @IsEnum(StoreTransactionFilterType)
  filterType: StoreTransactionFilterType

  @IsEnum(TimeRangePreset)
  timeRangePreset: TimeRangePreset

  @IsString()
  pageNum: string

  @IsString()
  pageSize: string
}