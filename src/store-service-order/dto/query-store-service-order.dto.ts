import { IsEnum, IsOptional, IsString } from "class-validator"

export enum StoreServiceOrderStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class QueryStoreServiceOrderDto {
  @IsEnum(StoreServiceOrderStatus)
  status: StoreServiceOrderStatus

  @IsString()
  @IsOptional()
  pageNum?: string

  @IsString()
  @IsOptional()
  pageSize?: string

  @IsString()
  @IsOptional()
  keyword?: string
}