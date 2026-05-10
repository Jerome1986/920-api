import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StoreServiceOrderService } from './store-service-order.service';
import { CreateStoreServiceOrderDto } from './dto/create-store-service-order.dto';
import { UpdateStoreServiceOrderDto } from './dto/update-store-service-order.dto';
import { ServiceOrderStatus } from '@prisma/client';
import { FreeStoreServiceOrderDto } from './dto/free-store-service-order.dto';
import { FreeStoreServiceOrderCompeletedDto } from './dto/free-store-service-order-completed.dto';

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

  @Get()
  async findAll() {
    return this.storeServiceOrderService.findAll()
  }

  // 订单详情
  @Get('detail/:outTradeNo')
  async findOne(@Param('outTradeNo') outTradeNo: string) {
    return this.storeServiceOrderService.findOne(outTradeNo)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStoreServiceOrderDto: UpdateStoreServiceOrderDto) {
    return this.storeServiceOrderService.update(+id, updateStoreServiceOrderDto)
  }

  // 更新订单状态
  @Patch('update/:outTradeNo')
  async updateOrder(@Param('outTradeNo') outTradeNo: string, @Body('status') status: ServiceOrderStatus) {
    return this.storeServiceOrderService.updateOrder(outTradeNo, status)
  }
}
