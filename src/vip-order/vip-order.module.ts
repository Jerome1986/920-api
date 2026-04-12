import { Module } from '@nestjs/common'
import { VipOrderService } from './vip-order.service'
import { VipOrderController } from './vip-order.controller'
import { VipOrderRepository } from './vip-order.repository'
import { PaymentRepository } from 'src/payment/payment.repository'

@Module({
  controllers: [VipOrderController],
  providers: [VipOrderService, VipOrderRepository, PaymentRepository],
})
export class VipOrderModule {}
