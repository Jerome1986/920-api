import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StoreServiceOrderService } from './store-service-order.service';
import { CreateStoreServiceOrderDto } from './dto/create-store-service-order.dto';
import { UpdateStoreServiceOrderDto } from './dto/update-store-service-order.dto';
import { ServiceOrderStatus } from '@prisma/client';
import { FreeStoreServiceOrderDto } from './dto/free-store-service-order.dto';
import { FreeStoreServiceOrderCompeletedDto } from './dto/free-store-service-order-completed.dto';
import { QueryStoreServiceOrderDto } from './dto/query-store-service-order.dto';

@Controller('store-service-order')
export class StoreServiceOrderController {
  constructor(private readonly storeServiceOrderService: StoreServiceOrderService) { }

  // 创建服务订单
  @Post('add')
  async create(@Body() createStoreServiceOrderDto: CreateStoreServiceOrderDto) {
    return this.storeServiceOrderService.create(createStoreServiceOrderDto);
  }

  // 创建会员免费服务订单
  @Post('freeAdd')
  async vipFreeOrderCreate(@Body() freeStoreServiceOrderDto: FreeStoreServiceOrderDto) {
    return this.storeServiceOrderService.vipFreeOrderCreate(freeStoreServiceOrderDto)
  }

  // 会员免费订单确认完成
  @Post('freeOrderCompleted')
  async vipFreeOrderCompleted(@Body() FreeOrderCompeletedDto: FreeStoreServiceOrderCompeletedDto) {
    return this.storeServiceOrderService.vipFreeOrderCompleted(FreeOrderCompeletedDto.outTradeNo, FreeOrderCompeletedDto.status)
  }

  // 获取所有线下贴膜订单
  @Get()
  async findAll(@Query() queryStoreServiceOrderDto: QueryStoreServiceOrderDto) {
    const status = queryStoreServiceOrderDto.status
    const pageNum = Number(queryStoreServiceOrderDto.pageNum) || 1
    const pageSize = Number(queryStoreServiceOrderDto.pageSize) || 10
    const keyword = queryStoreServiceOrderDto.keyword || ''

    return this.storeServiceOrderService.findAll(status, pageNum, pageSize, keyword)
  }

  // 订单详情
  @Get('detail/:outTradeNo')
  async findOne(@Param('outTradeNo') outTradeNo: string) {
    return this.storeServiceOrderService.findOne(outTradeNo)
  }

  // 更新订单状态
  @Patch('update/:outTradeNo')
  async updateOrder(@Param('outTradeNo') outTradeNo: string, @Body('status') status: ServiceOrderStatus) {
    return this.storeServiceOrderService.updateOrder(outTradeNo, status)
  }
}
