import { Injectable } from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { TocOrderRepository } from 'src/toc-order/toc-order.repository'

@Injectable()
export class NotifyRepository {
  constructor(private tocOrderRepo: TocOrderRepository) {}
  // 商品购买回调
  proNotify(orderId: string, status: OrderStatus) {}
}
