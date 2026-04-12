import { Module } from '@nestjs/common'
import { TocOrderService } from './toc-order.service'
import { TocOrderController } from './toc-order.controller'
import { TocOrderRepository } from './toc-order.repository'
import { TocOrderProductRepository } from 'src/toc-order-product/toc-order-product.repository'
import { TocOrderAddressRepository } from 'src/toc-order-address/toc-order-address.repository'
import { PaymentRepository } from 'src/payment/payment.repository'

@Module({
  controllers: [TocOrderController],
  providers: [
    TocOrderService,
    TocOrderRepository,
    TocOrderProductRepository,
    TocOrderAddressRepository,
    PaymentRepository,
  ],
})
export class TocOrderModule {}
