import { Module } from '@nestjs/common'
import { ProductImageRepository } from './product-image.repository'

@Module({
  providers: [ProductImageRepository],
})
export class TocProductImageModule {}
