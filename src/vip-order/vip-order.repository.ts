import { Injectable } from '@nestjs/common'
import { CreateVipOrderDto } from './dto/create-vip-order.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { QueryVipOrderStatus } from './dto/query-vip-order-dto'
import { VipOrderStatus } from '@prisma/client'

@Injectable()
export class VipOrderRepository {
  constructor(private prisma: PrismaService) {}

  // 创建会员订单
  async create(createVipOrderDto: CreateVipOrderDto) {
    const outTradeNo = generateOrderNo('VIP')
    return this.prisma.vipOrder.create({
      data: {
        outTradeNo,
        ...createVipOrderDto,
        status: 'PENDING',
      },
    })
  }

  // 更新会员订单
  async statusOrderUpdate(outTradeNo: string, status: VipOrderStatus, transactionId?: string) {
    const data: any = {
      status,
    }
    if (transactionId) {
      data.transactionId = transactionId
    }
    return this.prisma.vipOrder.update({
      where: { outTradeNo },
      data,
    })
  }

  // 查找当前会员订单
  findOneByUser(userId: string, status: QueryVipOrderStatus) {
    const where: any = {
      userId,
      status: {
        not: 'PENDING', // 全局直接排除，永远生效
      },
    }

    if (status !== 'ALL') {
      where.status.equals = status
    }

    return this.prisma.vipOrder.findMany({ where })
  }

  // 获取所有会员订单
  async findAll(status: QueryVipOrderStatus, pageNum: number, pageSize: number) {
    let where: any = {
      status: {
        not: 'PENDING', // 全局直接排除，永远生效
      },
    }
    if (status !== 'ALL') {
      where.status.equals = status
    }

    return await Promise.all([
      this.prisma.vipOrder.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.vipOrder.count({ where }),
    ])
  }

  // 根据用户电话和业务订单号查找会员订单--后台管理
  async findSearchByOrder(
    searchVal: string,
    status: QueryVipOrderStatus,
    pageNum: number,
    pageSize: number,
  ) {
    let where: any = {
      OR: [{ outTradeNo: { contains: searchVal } }, { userMobile: { contains: searchVal } }],
      status: {
        not: 'PENDING', // 全局直接排除，永远生效
      },
    }
    if (status !== 'ALL') {
      where.status.equals = status
    }
    return await Promise.all([
      this.prisma.vipOrder.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.vipOrder.count({ where }),
    ])
  }
}
