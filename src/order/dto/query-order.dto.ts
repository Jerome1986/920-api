import { IsEnum, IsString } from 'class-validator'

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

export enum QueryTarget {
  ALL = 'ALL',
  TOB = 'TOB',
  TOC = 'TOC'
}

export class QueryOrderDto {
  @IsEnum(OrderQueryStatus)
  status: OrderQueryStatus

  @IsEnum(QueryTarget)
  target: QueryTarget

  @IsString()
  pageNum: string

  @IsString()
  pageSize: string
}
