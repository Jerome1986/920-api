import { Type } from 'class-transformer'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'
import { CreateProductImageDto } from '../../product-image/dto/create-product-image.dto'
import { CreateProductModelDto } from '../../product-model/dto/create-product-model.dto'
import { BaseProductDto } from './base-product.dto'
import { CreateProductSkuNestedDto } from '../../product-sku/dto/create-product-sku.dto'

export class CreateProductDto extends BaseProductDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductModelDto)
  models?: CreateProductModelDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSkuNestedDto)
  skus?: CreateProductSkuNestedDto[]
}
