import { Type } from "class-transformer"
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator"

export enum QueryWithdrawStatus {
  ALL = "ALL",
  APPLYING = "APPLYING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID"
}

export class QueryWalletWithdrawApplyDto {
  // 当前页码
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number

  // 每页条数
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number

  // 提现状态：ALL 表示全部
  @IsOptional()
  @IsEnum(QueryWithdrawStatus)
  status?: QueryWithdrawStatus

  // 关键词：提现单号 / 用户ID / 收款人 / 收款账号 / 银行渠道
  @IsOptional()
  @IsString()
  keyword?: string

  // 申请开始时间，格式：YYYY-MM-DD
  @IsOptional()
  @IsDateString()
  createdStartAt?: string

  // 申请结束时间，格式：YYYY-MM-DD
  @IsOptional()
  @IsDateString()
  createdEndAt?: string
}
