import { Type } from "class-transformer"
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator"
import { SettlementStatusDto } from "./create-settlement-record.dto"

export enum QuerySettlementStatus {
  ALL = "ALL",
  PENDING = SettlementStatusDto.PENDING,
  SETTLED = SettlementStatusDto.SETTLED,
  CANCELLED = SettlementStatusDto.CANCELLED,
  REFUNDED = SettlementStatusDto.REFUNDED
}

export class QuerySettlementRecordDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number

  @IsOptional()
  @IsEnum(QuerySettlementStatus)
  status?: QuerySettlementStatus

  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsDateString()
  createdStartAt?: string

  @IsOptional()
  @IsDateString()
  createdEndAt?: string
}
