import { Body, Controller, Post } from '@nestjs/common'
import { ModelListDto } from './dto/model-list.dto'
import { QuickSellService } from './quick-sell.service'

@Controller('quickSell')
export class QuickSellController {
  constructor(private readonly quickSellService: QuickSellService) {}

  // 根据搜索内容匹配库存商品型号
  @Post('modelList')
  modelList(@Body() dto: ModelListDto) {
    return this.quickSellService.modelList(dto.searchVal)
  }
}
