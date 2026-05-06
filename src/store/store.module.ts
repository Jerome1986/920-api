import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreRepository } from './store.repository';
import { UserRepository } from 'src/user/user.repository';
import { StockModelRepository } from 'src/stock-model/stock-model.repositroy';
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { OrderRepository } from 'src/order/order.repository';

@Module({
  controllers: [StoreController],
  providers: [
    StoreService,
    StoreRepository,
    UserRepository,
    StockModelRepository,
    StoreInventoryRepositroy,
    WalletRepository,
    OrderRepository
  ],
})
export class StoreModule { }
