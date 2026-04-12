import { Module } from '@nestjs/common';
import { CommissionRuleService } from './commission-rule.service';
import { CommissionRuleController } from './commission-rule.controller';
import { CommissionRuleRepository } from './commission-rule.repository';

@Module({
  controllers: [CommissionRuleController],
  providers: [CommissionRuleService, CommissionRuleRepository],
})
export class CommissionRuleModule { }
