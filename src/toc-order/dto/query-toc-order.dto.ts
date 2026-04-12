import { IsEnum, IsNumber, IsString } from 'class-validator'

export enum OrderQueryStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PROCESSING = 'PROCESSING',
  REFUNDED = 'REFUNDED',
}

export class QueryTocOrderDto {
  @IsEnum(OrderQueryStatus)
  status: OrderQueryStatus

  @IsString()
  pageNum: string

  @IsString()
  pageSize: string
}
