import { Module } from '@nestjs/common'
import { OrderProductRepository } from './order-product.repository';

@Module({
  controllers: [],
  providers: [OrderProductRepository],
})
export class OrderProductModule { }
