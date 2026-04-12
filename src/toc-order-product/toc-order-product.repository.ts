import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTocOrderProductDto } from './dto/create-toc-order-product.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class TocOrderProductRepository {
  constructor(private prisma: PrismaService) { }

  // 创建订单里的商品
  createManyProducts(
    orderId: string,
    orderProductDto: CreateTocOrderProductDto[],
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
