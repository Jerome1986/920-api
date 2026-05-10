import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { StoreInventoryService } from './store-inventory.service';
import { SearchStoreInventoryDto } from './dto/search-store-inventory-dto';

@Controller('store-inventory')
export class StoreInventoryController {
  constructor(private readonly storeInventoryService: StoreInventoryService) { }

  // 根据当前分类获取当前门店库存
  @Get('sell/:storeId')
  async findAllByStoreWithCategory(
    @Param('storeId') storeId: string,
    @Query('categoryId') categoryId: number,
    @Query('pageNum') pageNum: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    console.log(storeId, categoryId)
    return this.storeInventoryService.findAllByStoreWithCategory(storeId, categoryId, pageNum, pageSize)
  }

  // 根据关键词和分类搜索库存商品
  @Post('sell/search')
  async searchWithCategory(@Body() searchStoreInventoryDto: SearchStoreInventoryDto) {
    return this.storeInventoryService.searchWithCategory(searchStoreInventoryDto)
  }

  // 扣减对应门店对应某个商品的库存
  @Patch('decrementStock/:storeId')
  async decrementStoreStock(
    @Param('storeId') storeId: string,
    @Body('skuId') skuId: string,
    @Body('quantity') quantity: string
  ) {
    console.log(skuId, quantity)

    return this.storeInventoryService.decrementStoreStock(storeId, Number(skuId), Number(quantity))
  }
}
