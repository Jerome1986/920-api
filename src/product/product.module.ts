import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { ProductRepository } from './product.repository'
import { ProductModelRepository } from 'src/product-model/product-model.repository'
import { ProductImageRepository } from 'src/product-image/product-image.repository'
import { ProductSkuRepository } from 'src/product-sku/product-sku.repository'
import { CategoryRepository } from 'src/category/category.repository'

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ProductModelRepository,
    ProductImageRepository,
    ProductSkuRepository,
    CategoryRepository
  ],
})
export class ProductModule {}
