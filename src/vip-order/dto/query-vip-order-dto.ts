import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum QueryVipOrderStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDING = 'REFUNDING',
}

export class QueryVipOrderDto {
  @IsOptional()
  @IsString()
  searchVal?: string

  @IsEnum(QueryVipOrderStatus)
  status: QueryVipOrderStatus

  @IsString()
  pageNum: string
  @IsString()
  pageSize: string
}
