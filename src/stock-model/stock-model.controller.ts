import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StockModelService } from './stock-model.service';
import { CreateStockModelDto } from './dto/create-stock-model.dto';
import { UpdateStockModelDto } from './dto/update-stock-model.dto';

@Controller('stock-model')
export class StockModelController {
  constructor(private readonly stockModelService: StockModelService) { }

  // 新增
  @Post('add')
  async create(@Body() createStockModelDto: CreateStockModelDto) {
    return this.stockModelService.create(createStockModelDto)
  }

  // 获取所有
  @Get()
  async findAll() {
    return this.stockModelService.findAll()
  }

  // 获取详情
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    return this.stockModelService.findOne(+id)
  }

  // 更新
  @Patch('update/:stockModelId')
  async updateOne(@Param('stockModelId') stockModelId: string, @Body() updateStockModelDto: UpdateStockModelDto) {
    return this.stockModelService.updateOne(+stockModelId, updateStockModelDto)
  }

  // 删除
  @Delete('del/:stockModelId')
  async deleteOne(@Param('stockModelId') stockModelId: number) {
    return this.stockModelService.deleteOne(stockModelId)
  }
}
