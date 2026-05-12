import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateStoreServiceOrderDto } from "./dto/create-store-service-order.dto"
import { generateOrderNo } from "src/utils/generateOrderNo"
import { Prisma, ServiceOrderStatus } from "@prisma/client"
import { FreeStoreServiceOrderDto } from "./dto/free-store-service-order.dto"
import { StoreServiceOrderStatus } from "./dto/query-store-service-order.dto"


@Injectable()
export class StoreServiceOrderRepository {
  constructor(
    private prisma: PrismaService,

  ) { }

  // 创建订单
  create(createStoreServiceOrderDto: CreateStoreServiceOrderDto) {
    const outTradeNo = generateOrderNo('SERVICE')
    return this.prisma.storeServiceOrder.create({ data: { outTradeNo, ...createStoreServiceOrderDto } })
  }

  // 创建免费会员订单
  vipFreeOrderCreate(outTradeNo: string, userId: string, freeStoreServiceOrderDto: FreeStoreServiceOrderDto) {
    return this.prisma.storeServiceOrder.create({ data: { outTradeNo, userId, ...freeStoreServiceOrderDto, status: "PAID" } })
  }

  // 获取所有线下贴膜订单
  findAll(status: StoreServiceOrderStatus, pageNum: number, pageSize: number, keyword: string) {
    let where: any = {}
    if (status !== 'ALL') where.status = status
    if (keyword) where.OR = [
      { storeId: keyword },
      { memberPhone: { contains: keyword } },
      { outTradeNo: keyword }
    ]
    return Promise.all([
      this.prisma.storeServiceOrder.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.storeServiceOrder.count({ where })
    ])
  }

  // 订单详情
  findOne(outTradeNo: string) {
    return this.prisma.storeServiceOrder.findFirst({
      where: { outTradeNo }
    })
  }

  // 更新订单状态
  updateOrder(outTradeNo: string, status: ServiceOrderStatus, openid?: string, tx?: Prisma.TransactionClient) {
    console.log(status)
    const db = tx ?? this.prisma
    let data: any = {
      status
    }

    if (status === "CANCELLED") data.cancelledAt = new Date()

    if (status === "PAID" && openid) {
      data.paidAt = new Date()
      data.openid = openid
    }

    if (status === 'COMPLETED') {
      data.completedAt = new Date()
    }

    return db.storeServiceOrder.update({
      where: { outTradeNo },
      data
    })
  }
}