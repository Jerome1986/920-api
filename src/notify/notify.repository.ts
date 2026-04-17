import { Injectable } from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { OrderRepository } from 'src/order/order.repository'

@Injectable()
export class NotifyRepository {
  constructor(private OrderRepo: OrderRepository) { }
  // 商品购买回调
  proNotify(orderId: string, status: OrderStatus) { }
}
