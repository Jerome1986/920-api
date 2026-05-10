import { Module } from '@nestjs/common';
import { StoreServiceOrderService } from './store-service-order.service';
import { StoreServiceOrderController } from './store-service-order.controller';
import { StoreServiceOrderRepository } from './store-service-order.repository';
import { UserRepository } from 'src/user/user.repository';
import { StoreTransactionRepository } from 'src/store-transaction/store-transaction.repository';
import { CommissionRuleService } from 'src/commission-rule/commission-rule.service';
import { CommissionRuleRepository } from 'src/commission-rule/commission-rule.repository';
import { SettlementRecordRepository } from 'src/settlement-record/settlement-record.repository';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository';
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository';

@Module({
  controllers: [StoreServiceOrderController],
  providers: [
    StoreInventoryRepositroy,
    StoreServiceOrderService,
    StoreTransactionRepository,
    StoreServiceOrderRepository,
    CommissionRuleService,
    CommissionRuleRepository,
    SettlementRecordRepository,
    WalletRepository,
    WallettransactionRepository,
    UserRepository
  ],
})
export class StoreServiceOrderModule { }
