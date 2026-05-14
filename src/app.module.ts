import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { PrismaModule } from './prisma/prisma.modules'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './admin/admin.module'
import { AuthModule } from './auth/auth.module'
import { BannerModule } from './banner/banner.module'
import { TeamShowModule } from './team-show/team-show.module'
import { TocCategoryModule } from './category/category.module'
import { ProductModule } from './product/product.module'
import { PhoneModelModule } from './phone-model/phone-model.module'
import { ProductModelModule } from './product-model/product-model.module'
import { TocProductImageModule } from './product-image/product-image.module'
import { ProductSkuModule } from './product-sku/product-sku.module'
import { RateRuleModule } from './rate-rule/rate-rule.module'
import { OrderModule } from './order/order.module'
import { OrderAddressModule } from './order-address/order-address.module'
import { PaymentModule } from './payment/payment.module'
import { NotifyModule } from './notify/notify.module'
import { PointsFlowModule } from './points-flow/points-flow.module'
import { VipPlanModule } from './vip-plan/vip-plan.module'
import { VipOrderModule } from './vip-order/vip-order.module'
import { JobApplyModule } from './job-apply/job-apply.module'
import { ScheduleModule } from '@nestjs/schedule'
import { StockModelModule } from './stock-model/stock-model.module';
import { StoreModule } from './store/store.module';
import { StoreInventoryModule } from './store-inventory/store-inventory.module';
import { CommissionRuleModule } from './commission-rule/commission-rule.module';
import { OrderProductModule } from './order-product/order-product.module'
import { StoreTransactionModule } from './store-transaction/store-transaction.module';
import { SettlementRecordModule } from './settlement-record/settlement-record.module';
import { WalletModule } from './wallet/wallet.module';
import { WalletTransactionModule } from './wallet-transaction/wallet-transaction.module';
import { StoreServiceOrderModule } from './store-service-order/store-service-order.module';
import { WalletWithdrawApplyModule } from './wallet-withdraw-apply/wallet-withdraw-apply.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PageCodeModule } from './page-code/page-code.module';
import { QuickSellModule } from './quick-sell/quick-sell.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    AdminModule,
    AuthModule,
    BannerModule,
    TeamShowModule,
    TocCategoryModule,
    ProductModule,
    PhoneModelModule,
    ProductModelModule,
    TocProductImageModule,
    ProductSkuModule,
    RateRuleModule,
    OrderModule,
    OrderProductModule,
    OrderAddressModule,
    PaymentModule,
    NotifyModule,
    PointsFlowModule,
    VipPlanModule,
    VipOrderModule,
    JobApplyModule,
    StockModelModule,
    StoreModule,
    StoreInventoryModule,
    CommissionRuleModule,
    StoreTransactionModule,
    SettlementRecordModule,
    WalletModule,
    WalletTransactionModule,
    StoreServiceOrderModule,
    WalletWithdrawApplyModule,
    DashboardModule,
    PageCodeModule,
    QuickSellModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
