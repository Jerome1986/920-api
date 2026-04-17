import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { OrderStatus, Prisma } from '@prisma/client'
import { OrderQueryStatus, QueryTarget } from './dto/query-order.dto'

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) { }

  // 商品订单创建-支付订单
  create(createTocOrderDto: CreateOrderDto, tx: Prisma.TransactionClient) {
    const outTradeNo = generateOrderNo('PRO')
    return tx.order.create({
      data: {
        outTradeNo,
        status: 'PENDING',
        target: 'TOC',

        openid: createTocOrderDto.openid,
        userId: createTocOrderDto.userId,
        nickname: createTocOrderDto.nickname as string,
        mobile: createTocOrderDto.mobile,
        avatarUrl: createTocOrderDto.avatarUrl,

        totalCount: createTocOrderDto.totalCount,
        totalPrice: createTocOrderDto.totalPrice,
        deductAmount: createTocOrderDto.deductAmount,
        actualPayment: createTocOrderDto.actualPayment,
        usedScore: createTocOrderDto.usedScore,

        paymentMethod: createTocOrderDto.paymentMethod,
        remark: createTocOrderDto.remark,
        createdAt: new Date(),
      },
    })
  }

  // 获取所有订单
  async findAll(status: OrderQueryStatus, target: QueryTarget, pageNum: number, pageSize: number) {
    let where: any = {}
    if (status !== 'ALL') where.status = status
    if (target !== 'ALL') where.target = target

    return await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { address: true, products: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count({ where }),
    ])
  }

  // 查询用户订单
  async findUserOrder(userId: string, status: OrderQueryStatus, pageNum: number, pageSize: number) {
    let where: any = {
      userId,
      target: 'TOC'
    }
    if (status !== 'ALL') {
      where.status = status
    }

    // 退款中/已退款
    if (status === 'PROCESSING' || status === 'REFUNDED') {
      where.status = { in: ['PROCESSING', 'REFUNDED'] }
    }

    return await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { products: true, address: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])
  }

  // 更新指定订单状态
  statusOrderUpdate(outTradeNo: string, status: OrderStatus, transactionId?: string) {
    console.log('status', status)
    const data: any = {
      status,
    }

    if (transactionId) {
      data.transactionId = transactionId
    }

    if (status === 'PAID') {
      data.paidAt = new Date()
    }

    if (status === 'SHIPPED') {
      data.shippedAt = new Date()
    }

    return this.prisma.order.update({
      where: { outTradeNo },
      data,
    })
  }

  // 用户确定收货
  async updateOrderCompleted(outTradeNo: string, userId: string) {
    return this.prisma.order.update({
      where: {
        outTradeNo,
        userId
      },
      data: { status: 'COMPLETED', completedAt: new Date() }
    })
  }

  // 获取订单详情
  findOne(outTradeNo: string) {
    return this.prisma.order.findUnique({
      where: { outTradeNo },
      include: { products: true, address: true },
    })
  }
}
