import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { OrderStatus, Prisma, ServiceOrderStatus } from '@prisma/client'
import { OrderQueryStatus, QueryTarget } from './dto/query-order.dto'
import { TimeRangePreset } from 'src/store-transaction/dto/query-store-transaction.dto'

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) { }

  // 商品订单创建-支付订单
  create(createTocOrderDto: CreateOrderDto, tx: Prisma.TransactionClient) {
    const target = createTocOrderDto.target
    let outTradeNo = generateOrderNo('MANAGER')
    if (target === 'TOC') {
      outTradeNo = generateOrderNo('PRO')
    }

    return tx.order.create({
      data: {
        outTradeNo,
        status: 'PENDING',
        target,

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
  async findUserOrder(userId: string, status: OrderQueryStatus, target: QueryTarget, pageNum: number, pageSize: number) {
    let where: any = {
      userId,
      target
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
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])
  }

  // 更新指定订单状态
  statusOrderUpdate(outTradeNo: string, status: OrderStatus, transactionId?: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
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

    return db.order.update({
      where: { outTradeNo },
      data,
    })
  }

  // 用户确定收货
  async updateOrderCompleted(outTradeNo: string, userId?: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    const where: Prisma.OrderWhereUniqueInput = userId
      ? { outTradeNo, userId }
      : { outTradeNo }

    return db.order.update({
      where,
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

  // 获取店长的进货单 -- 根据时间获取
  findTobOrder(userId: string, timeRangePreset: TimeRangePreset, status: OrderStatus) {
    const now = new Date()
    // 时间映射
    const timeRangeMap: Record<TimeRangePreset, Date> = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    }

    let where: any = {
      userId,
      status,
      createdAt: {
        gte: timeRangeMap[timeRangePreset],
      },
    }
    return this.prisma.order.findMany({ where })
  }

  // 获取指定门店服务订单(贴膜订单) -- 根据时间获取
  findStoreOrder(storeId: string, timeRangePreset: TimeRangePreset, status: ServiceOrderStatus) {
    const now = new Date()
    // 时间映射
    const timeRangeMap: Record<TimeRangePreset, Date> = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    }

    let where: any = {
      storeId,
      status,
      createdAt: {
        gte: timeRangeMap[timeRangePreset],
      },
    }
    return this.prisma.storeServiceOrder.findMany({ where })
  }

  // 获取用户贴膜订单
  findStoreByUserOrder(userId: string) {
    return this.prisma.storeServiceOrder.findMany({
      where: { userId, status: 'COMPLETED' }
    })
  }

  // 根据商品货号搜索用户匹配的订单
  async purchaseOrderSearchBySkuNoApi(target: QueryTarget, userId: string, skuNo: string, status: OrderQueryStatus, pageNum: number, pageSize: number) {
    let where: any = {
      userId,
      products: {
        some: {
          skuNo: { contains: skuNo }
        }
      }
    }

    if (target !== 'ALL') where.target = target
    if (status !== 'ALL') where.status = status

    if (status === 'PROCESSING' || status === 'REFUNDED') {
      where.status = { in: ['PROCESSING', 'REFUNDED'] }
    }

    return await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { address: true, products: true },
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.order.count({ where })
    ])
  }
}
