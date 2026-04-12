import { Module } from '@nestjs/common'
import { PaymentRepository } from './payment.repository'

@Module({
  controllers: [],
  providers: [PaymentRepository],
})
export class PaymentModule {}
