import { Module } from '@nestjs/common';
import { StoreInventoryService } from './store-inventory.service';
import { StoreInventoryController } from './store-inventory.controller';
import { StoreInventoryRepositroy } from './store-inventory.repository';

@Module({
  controllers: [StoreInventoryController],
  providers: [StoreInventoryService, StoreInventoryRepositroy],
})
export class StoreInventoryModule { }
