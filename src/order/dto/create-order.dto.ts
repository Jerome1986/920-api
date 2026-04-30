import { PaymentMethod } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'
import { CreateOrderAddressDto } from 'src/order-address/dto/create-order-address.dto'
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto'

// 分类/商品目标枚举
export enum TargetDto {
  TOC = "TOC",
  TOB = "TOB"
}


export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'openid不可以为空' })
  openid: string

  @IsString()
  @IsNotEmpty({ message: '用户ID不可以为空' })
  userId: string

  @IsEnum(TargetDto)
  @IsNotEmpty({ message: '订单类型不可以为空' })
  target: TargetDto

  @IsOptional()
  @IsString()
  nickname?: string

  @IsString()
  @IsNotEmpty({ message: '用户电话不可以为空' })
  mobile: string

  @IsOptional()
  @IsString()
  avatarUrl?: string

  @IsNumber()
  @Min(1, { message: '商品总数量必须大于0' })
  totalCount: number

  @IsNumber()
  @Min(0, { message: '总金额不能小于0' })
  totalPrice: number

  @IsNumber()
  @Min(0, { message: '优惠金额不能小于0' })
  deductAmount: number

  @IsNumber()
  @Min(0, { message: '实付金额不能小于0' })
  actualPayment: number

  @IsNumber()
  @Min(0, { message: '使用积分不能小于0' })
  usedScore: number

  @IsEnum(PaymentMethod, { message: '支付方式不合法' })
  paymentMethod: PaymentMethod

  @IsOptional()
  @IsString()
  remark?: string

  @IsArray({ message: '商品列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductDto)
  products: CreateOrderProductDto[]

  @IsNotEmpty({ message: '收货地址不可以为空' })
  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  addressInfo: CreateOrderAddressDto
}
