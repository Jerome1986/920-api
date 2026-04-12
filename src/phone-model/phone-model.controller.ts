import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { PhoneModelService } from './phone-model.service'
import { CreatePhoneModelDto } from './dto/create-phone-model.dto'
import { UpdatePhoneModelDto } from './dto/update-phone-model.dto'

@Controller('phone-model')
export class PhoneModelController {
  constructor(private readonly phoneModelService: PhoneModelService) { }

  // 新增手机型号
  @Post('add')
  async create(@Body() createPhoneModelDto: CreatePhoneModelDto) {
    return this.phoneModelService.create(createPhoneModelDto)
  }

  // 根据型号设备码设备手机型号
  @Post('device')
  async deviceInfo(@Body('model') model: string) {
    return this.phoneModelService.deviceInfo(model)
  }

  // 获取所有手机型号
  @Get()
  async findAll(@Query() query: { pageNum: string; pageSize: string, kw?: string }) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    const keyWord = query.kw?.trim() || ''
    return this.phoneModelService.findAll(pageNum, pageSize, keyWord)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePhoneModelDto: UpdatePhoneModelDto) {
    return this.phoneModelService.update(+id, updatePhoneModelDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.phoneModelService.remove(+id)
  }
}
