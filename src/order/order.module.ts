import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepository } from './order.repository'
import { OrderProductRepository } from 'src/order-product/order-product.repository'
import { OrderAddressRepository } from 'src/order-address/order-address.repository'
import { PaymentRepository } from 'src/payment/payment.repository'
import { RateRuleRepository } from 'src/rate-rule/rate-rule.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
import { CommissionRuleRepository } from 'src/commission-rule/commission-rule.repository'
import { CommissionRuleService } from 'src/commission-rule/commission-rule.service'
import { SettlementRecordRepository } from 'src/settlement-record/settlement-record.repository'
import { WalletRepository } from 'src/wallet/wallet.repository'
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository'
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository'
import { ProductSkuRepository } from 'src/product-sku/product-sku.repository'

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    OrderProductRepository,
    OrderAddressRepository,
    PaymentRepository,
    RateRuleRepository,
    UserRepository,
    PointsFlowRepository,
    CommissionRuleRepository,
    CommissionRuleService,
    SettlementRecordRepository,
    WalletRepository,
    WallettransactionRepository,
    StoreInventoryRepositroy,
    ProductSkuRepository
  ],
})
export class OrderModule { }
