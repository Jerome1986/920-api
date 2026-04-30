import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { OrderService } from './order.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { QueryOrderDto } from './dto/query-order.dto'
import { OrderStatus } from '@prisma/client'
import { CancelOrderDto } from './dto/cancel-order.dto'
import { UpdateOrderCompletedDto } from './dto/update-order-completed.dto'

@Controller('order')
export class OrderController {
  constructor(private readonly OrderService: OrderService) { }

  // 商品订单创建-支付订单
  @Post('create')
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.OrderService.create(createOrderDto)
  }

  // 获取所有商品订单
  @Get()
  async findAll(@Query() query: QueryOrderDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.OrderService.findAll(query.status, query.target, pageNum, pageSize)
  }

  // 根据订单状态获取指定的C端商品用户订单
  @Get(':userId')
  async findUserOrder(@Param('userId') userId: string, @Query() query: QueryOrderDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10

    return this.OrderService.findUserOrder(userId, query.status, query.target, pageNum, pageSize)
  }

  // 获取订单详情
  @Get('detail/:outTradeNo')
  async findOne(@Param('outTradeNo') outTradeNo: string) {
    return this.OrderService.findOne(outTradeNo)
  }

  // 更新指定订单状态
  @Patch('status/:outTradeNo')
  async statusOrderUpdate(@Param('outTradeNo') outTradeNo: string, @Body('status') status: OrderStatus) {
    return this.OrderService.statusOrderUpdate(outTradeNo, status)
  }

  // 用户确认收货
  @Patch('completed/:outTradeNo')
  async updateOrderCompleted(@Param('outTradeNo') outTradeNo: string, @Body('userId') userId: string) {
    return this.OrderService.updateOrderCompleted(outTradeNo, userId)
  }


  // 取消订单-并发起退款
  @Patch('cancel/:outTradeNo')
  async cancelOrder(
    @Param('outTradeNo') outTradeNo: string,
    @Body() CancelTocOrderDto: CancelOrderDto,
  ) {
    return this.OrderService.cancelOrder(outTradeNo, CancelTocOrderDto)
  }
}
