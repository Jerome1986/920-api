import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { OrderQueryStatus, QueryTarget } from './query-order.dto'

export class SearchOrderDto {
  @IsString()
  userId: string

  @IsEnum(QueryTarget)
  target: QueryTarget

  @IsString()
  @IsNotEmpty()
  skuNo: string

  @IsEnum(OrderQueryStatus)
  status: OrderQueryStatus

  @IsInt()
  @Min(1)
  @IsOptional()
  pageNum?: number

  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number
}
