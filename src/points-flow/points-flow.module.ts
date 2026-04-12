import { Module } from '@nestjs/common'
import { PointsFlowService } from './points-flow.service'
import { PointsFlowController } from './points-flow.controller'
import { PointsFlowRepository } from './points-flow.repository'

@Module({
  controllers: [PointsFlowController],
  providers: [PointsFlowService, PointsFlowRepository],
})
export class PointsFlowModule {}
