import { Module } from '@nestjs/common'
import { OrderAddressRepository } from './order-address.repository';

@Module({
  controllers: [],
  providers: [OrderAddressRepository],
})
export class OrderAddressModule { }
