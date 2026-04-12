import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionRuleService } from './commission-rule.service';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';

@Controller('commission-rule')
export class CommissionRuleController {
  constructor(private readonly commissionRuleService: CommissionRuleService) { }

  // 获取佣金规则
  @Get()
  findAll() {
    return this.commissionRuleService.findAll()
  }

  // 设置总佣金
  @Patch('totalRate/:id')
  async setTotalRate(@Param('id') id: string, @Body('totalRate') totalRate: string) {
    return this.commissionRuleService.setTotalRate(+id, totalRate)
  }

  // 更新佣金规则
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommissionRuleDto: UpdateCommissionRuleDto) {
    return this.commissionRuleService.update(+id, updateCommissionRuleDto)
  }
}
