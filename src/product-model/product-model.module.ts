import { Module } from '@nestjs/common'
import { ProductModelRepository } from './product-model.repository'

@Module({
  providers: [ProductModelRepository],
})
export class ProductModelModule {}
