import { Module } from '@nestjs/common'
import { VipPlanService } from './vip-plan.service'
import { VipPlanController } from './vip-plan.controller'
import { VipPlanRepository } from './vip-plan.repository'

@Module({
  controllers: [VipPlanController],
  providers: [VipPlanService, VipPlanRepository],
})
export class VipPlanModule {}
