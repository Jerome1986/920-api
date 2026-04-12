import { PartialType } from '@nestjs/mapped-types'
import { CreateProductSkuNestedDto } from './create-product-sku.dto'
import { IsNumber, IsOptional } from 'class-validator'

export class UpdateProductSkuDto extends PartialType(CreateProductSkuNestedDto) {
  @IsOptional()
  @IsNumber()
  id: number
}
