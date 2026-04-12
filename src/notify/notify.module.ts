import { Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { NotifyController } from './notify.controller'
import { NotifyRepository } from './notify.repository'
import { TocOrderRepository } from 'src/toc-order/toc-order.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
import { RateRuleRepository } from 'src/rate-rule/rate-rule.repository'
import { VipOrderRepository } from 'src/vip-order/vip-order.repository'

@Module({
  controllers: [NotifyController],
  providers: [
    NotifyService,
    NotifyRepository,
    TocOrderRepository,
    UserRepository,
    PointsFlowRepository,
    RateRuleRepository,
    VipOrderRepository,
  ],
})
export class NotifyModule {}
