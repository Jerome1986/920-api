import { Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { NotifyController } from './notify.controller'
import { NotifyRepository } from './notify.repository'
import { OrderRepository } from 'src/order/order.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
import { RateRuleRepository } from 'src/rate-rule/rate-rule.repository'
import { VipOrderRepository } from 'src/vip-order/vip-order.repository'
import { CommissionRuleRepository } from 'src/commission-rule/commission-rule.repository'
import { StoreTransactionRepository } from 'src/store-transaction/store-transaction.repository'
import { SettlementRecordRepository } from 'src/settlement-record/settlement-record.repository'
import { CommissionRuleModule } from 'src/commission-rule/commission-rule.module'
import { CommissionRuleService } from 'src/commission-rule/commission-rule.service'
import { StoreServiceOrderRepository } from 'src/store-service-order/store-service-order.repository'
import { AuthRepository } from 'src/auth/auth.repository'
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository'
import { WalletRepository } from 'src/wallet/wallet.repository'
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository'

@Module({
  controllers: [NotifyController],
  providers: [
    NotifyService,
    NotifyRepository,
    OrderRepository,
    UserRepository,
    PointsFlowRepository,
    RateRuleRepository,
    VipOrderRepository,
    CommissionRuleRepository,
    StoreTransactionRepository,
    SettlementRecordRepository,
    CommissionRuleModule,
    CommissionRuleService,
    StoreServiceOrderRepository,
    AuthRepository,
    StoreInventoryRepositroy,
    WalletRepository,
    WallettransactionRepository
  ],
})
export class NotifyModule { }
