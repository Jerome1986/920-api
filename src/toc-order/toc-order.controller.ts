import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { TocOrderService } from './toc-order.service'
import { CreateTocOrderDto } from './dto/create-toc-order.dto'
import { QueryTocOrderDto } from './dto/query-toc-order.dto'
import { OrderStatus } from '@prisma/client'
import { CancelTocOrderDto } from './dto/cancel-toc-order.dto'

@Controller('toc-order')
export class TocOrderController {
  constructor(private readonly tocOrderService: TocOrderService) {}

  // c端商品订单创建-支付订单
  @Post('create')
  async create(@Body() createTocOrderDto: CreateTocOrderDto) {
    return this.tocOrderService.create(createTocOrderDto)
  }

  // 获取所有C端商品订单
  @Get()
  async findAll(@Query() query: QueryTocOrderDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.tocOrderService.findAll(query.status, pageNum, pageSize)
  }

  // 根据订单状态获取指定的C端商品用户订单
  @Get(':userId')
  async findUserOrder(@Param('userId') userId: string, @Query() query: QueryTocOrderDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10

    return this.tocOrderService.findUserOrder(userId, query.status, pageNum, pageSize)
  }

  // 获取订单详情
  @Get('detail/:outTradeNo')
  async findOne(@Param('outTradeNo') outTradeNo: string) {
    return this.tocOrderService.findOne(outTradeNo)
  }

  // 更新指定订单状态
  @Patch('status/:outTradeNo')
  async statusOrderUpdate(@Param('outTradeNo') outTradeNo: string, @Body() status: OrderStatus) {
    return this.tocOrderService.statusOrderUpdate(outTradeNo, status)
  }

  // 取消订单-并发起退款
  @Patch('cancel/:outTradeNo')
  async cancelOrder(
    @Param('outTradeNo') outTradeNo: string,
    @Body() CancelTocOrderDto: CancelTocOrderDto,
  ) {
    return this.tocOrderService.cancelOrder(outTradeNo, CancelTocOrderDto)
  }
}
