import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  // 获取用户佣金明细
  @Get('detail/:userId')
  findOneByUser(@Param('userId') userId: string, @Query() query: { pageNum: string, pageSize: string }) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.commissionRuleService.findOneByUser(userId, pageNum, pageSize)
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
