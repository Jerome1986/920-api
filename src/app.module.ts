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
import { TocOrderModule } from './toc-order/toc-order.module'
import { TocOrderProductModule } from './toc-order-product/toc-order-product.module'
import { TocOrderAddressModule } from './toc-order-address/toc-order-address.module'
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
    TocOrderModule,
    TocOrderProductModule,
    TocOrderAddressModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
