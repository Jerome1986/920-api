import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { VipOrderService } from './vip-order.service'
import { CreateVipOrderDto } from './dto/create-vip-order.dto'
import { QueryVipOrderDto, QueryVipOrderStatus } from './dto/query-vip-order-dto'

@Controller('vip-order')
export class VipOrderController {
  constructor(private readonly vipOrderService: VipOrderService) {}

  // 创建会员订单
  @Post('add')
  async create(@Body() createVipOrderDto: CreateVipOrderDto) {
    return this.vipOrderService.create(createVipOrderDto)
  }

  // 根据用户ID获取会员
  @Get('user/:userId')
  async findOneByUser(
    @Param('userId') userId: string,
    @Query('status') status: QueryVipOrderStatus,
  ) {
    console.log('status', status)

    return this.vipOrderService.findOneByUser(userId, status)
  }

  // 获取所有会员订单
  @Get()
  async findAll(@Query() query: QueryVipOrderDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.vipOrderService.findAll(query.status, pageNum, pageSize)
  }

  // 根据用户电话和业务订单号查找会员订单--后台管理
  @Get('search')
  async findSearchByOrder(@Query() query: QueryVipOrderDto) {
    const searchVal = query.searchVal as string
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.vipOrderService.findSearchByOrder(searchVal, query.status, pageNum, pageSize)
  }
}
