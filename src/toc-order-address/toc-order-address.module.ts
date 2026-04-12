import { Module } from '@nestjs/common'
import { TocOrderAddressRepository } from './toc-order-address.repository'

@Module({
  controllers: [],
  providers: [TocOrderAddressRepository],
})
export class TocOrderAddressModule {}
