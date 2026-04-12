import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { RateRuleService } from './rate-rule.service'
import { CreateRateRuleDto } from './dto/create-rate-rule.dto'
import { UpdateRateRuleDto } from './dto/update-rate-rule.dto'

@Controller('rate-rule')
export class RateRuleController {
  constructor(private readonly rateRuleService: RateRuleService) {}

  // 创建积分规则
  @Post('add')
  create(@Body() createRateRuleDto: CreateRateRuleDto) {
    return this.rateRuleService.create(createRateRuleDto)
  }

  // 获取积分规则只能获取一个
  @Get()
  findAll() {
    return this.rateRuleService.findAll()
  }

  // 根据ID更新当前积分
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRateRuleDto: UpdateRateRuleDto) {
    return this.rateRuleService.update(id, updateRateRuleDto)
  }

  // 删除当前积分规则
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.rateRuleService.remove(id)
  }
}
