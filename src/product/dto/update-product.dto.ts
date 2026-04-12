import { PartialType } from '@nestjs/mapped-types'
import { BaseProductDto } from './base-product.dto'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateProductImageDto } from 'src/product-image/dto/create-product-image.dto'
import { CreateProductModelDto } from 'src/product-model/dto/create-product-model.dto'
import { UpdateProductSkuDto } from 'src/product-sku/dto/update-product-sku.dto'

export class UpdateProductDto extends PartialType(BaseProductDto) {
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
  @Type(() => UpdateProductSkuDto)
  skus?: UpdateProductSkuDto[]
}
