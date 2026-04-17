import { Module } from '@nestjs/common';
import { CommissionRuleService } from './commission-rule.service';
import { CommissionRuleController } from './commission-rule.controller';
import { CommissionRuleRepository } from './commission-rule.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [CommissionRuleController],
  providers: [CommissionRuleService, CommissionRuleRepository, UserRepository],
})
export class CommissionRuleModule { }
