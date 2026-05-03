import { IsEnum, IsOptional, IsString } from "class-validator"

export enum WalletFilterTab {
  ALL = "ALL",
  IN = "IN",
  OUT = "OUT"
}

export class QueryWalletTransactionDto {
  @IsString()
  @IsEnum(WalletFilterTab)
  tab: WalletFilterTab

  @IsString()
  @IsOptional()
  pageNum: string

  @IsString()
  @IsOptional()
  pageSize: string
}