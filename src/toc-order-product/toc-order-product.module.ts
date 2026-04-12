import { Module } from '@nestjs/common'
import { TocOrderProductRepository } from './toc-order-product.repository'

@Module({
  controllers: [],
  providers: [TocOrderProductRepository],
})
export class TocOrderProductModule {}
