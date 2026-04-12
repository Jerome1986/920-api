import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { VipPlanService } from './vip-plan.service'
import { CreateVipPlanDto } from './dto/create-vip-plan.dto'
import { UpdateVipPlanDto } from './dto/update-vip-plan.dto'

@Controller('vip-plan')
export class VipPlanController {
  constructor(private readonly vipPlanService: VipPlanService) { }

  // 添加会员产品
  @Post('add')
  async create(@Body() createVipPlanDto: CreateVipPlanDto) {
    return this.vipPlanService.create(createVipPlanDto)
  }

  // 获取所有会员产品
  @Get()
  async findAll() {
    return this.vipPlanService.findAll()
  }

  @Get('detail/:planId')
  async findOne(@Param('planId') planId: string) {
    return this.vipPlanService.findOne(+planId)
  }

  // 更新会员产品
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVipPlanDto: UpdateVipPlanDto) {
    console.log('更新参数', updateVipPlanDto)
    return this.vipPlanService.update(+id, updateVipPlanDto)
  }

  // 删除会员产品
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.vipPlanService.delete(+id)
  }
}
