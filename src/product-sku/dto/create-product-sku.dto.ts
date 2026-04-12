import { Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsNumber, IsObject, IsOptional, IsString } from 'class-validator'

/**
 * 随商品一并创建时的 SKU（无 productId，由后端/事务写入）
 * 对应 TocProductSku 除 id、productId 外的可填字段
 */
export class CreateProductSkuNestedDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'SKU 价格须为数字，最多两位小数' })
  costPrice: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'SKU 价格须为数字，最多两位小数' })
  salePrice: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stock?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minStock: number

  @IsOptional()
  @IsString()
  image?: string

  /** 对应 attrs Json，如 { "颜色": "红色", "尺寸": "M" } */
  @IsObject()
  attrs: Prisma.InputJsonValue

  @IsOptional()
  @IsString()
  unit?: string
}
