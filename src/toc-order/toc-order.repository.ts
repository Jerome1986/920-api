import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTocOrderDto } from './dto/create-toc-order.dto'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { OrderStatus, Prisma } from '@prisma/client'
import { OrderQueryStatus } from './dto/query-toc-order.dto'

@Injectable()
export class TocOrderRepository {
  constructor(private prisma: PrismaService) { }

  // c端商品订单创建-支付订单
  create(createTocOrderDto: CreateTocOrderDto, tx: Prisma.TransactionClient) {
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

  // 获取所有C端订单
  async findAll(status: OrderQueryStatus, pageNum: number, pageSize: number) {
    let where: any = {}
    if (status !== 'ALL') {
      where.status = status
    }
    return await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { address: true, products: true },
      }),
      this.prisma.order.count({ where }),
    ])
  }

  // 查询用户订单
  async findUserOrder(userId: string, status: OrderQueryStatus, pageNum: number, pageSize: number) {
    let where: any = {
      userId,
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
    const data: any = {
      status,
    }
    if (transactionId) {
      data.transactionId = transactionId
    }
    return this.prisma.order.update({
      where: { outTradeNo },
      data,
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
