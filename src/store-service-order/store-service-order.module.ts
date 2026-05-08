import { Module } from '@nestjs/common';
import { StoreServiceOrderService } from './store-service-order.service';
import { StoreServiceOrderController } from './store-service-order.controller';
import { StoreServiceOrderRepository } from './store-service-order.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [StoreServiceOrderController],
  providers: [StoreServiceOrderService, StoreServiceOrderRepository, UserRepository],
})
export class StoreServiceOrderModule { }
