import { Module } from '@nestjs/common'
import { ProductSkuRepository } from './product-sku.repository'

@Module({
  providers: [ProductSkuRepository],
})
export class ProductSkuModule {}
