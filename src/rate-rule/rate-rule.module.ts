import { Module } from '@nestjs/common'
import { RateRuleService } from './rate-rule.service'
import { RateRuleController } from './rate-rule.controller'
import { RateRuleRepository } from './rate-rule.repository'

@Module({
  controllers: [RateRuleController],
  providers: [RateRuleService, RateRuleRepository],
})
export class RateRuleModule {}
