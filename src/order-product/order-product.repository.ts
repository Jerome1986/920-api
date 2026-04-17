import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateOrderProductDto } from './dto/create-order-product.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class OrderProductRepository {
  constructor(private prisma: PrismaService) { }

  // 创建订单里的商品
  createManyProducts(
    orderId: string,
    orderProductDto: CreateOrderProductDto[],
    tx: Prisma.TransactionClient,
  ) {
    return tx.orderProduct.createMany({
      data: orderProductDto.map((p) => ({
        orderId,
        ...p,
      })),
    })
  }
}
