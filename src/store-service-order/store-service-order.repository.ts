import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateStoreServiceOrderDto } from "./dto/create-store-service-order.dto"
import { generateOrderNo } from "src/utils/generateOrderNo"
import { FreeBenefitSource, Prisma, ServiceOrderStatus } from "@prisma/client"
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
  vipFreeOrderCreate(
    outTradeNo: string,
    userId: string,
    freeStoreServiceOrderDto: FreeStoreServiceOrderDto,
    freeBenefitSource: FreeBenefitSource,
    agentInviteClaimId: string | null,
    paidAt: Date,
    tx: Prisma.TransactionClient,
  ) {
    // 1. 创建已进入服务中的免费订单，并记录实际占用的权益来源
    return tx.storeServiceOrder.create({
      data: {
        outTradeNo,
        userId,
        ...freeStoreServiceOrderDto,
        status: "PAID",
        paidAt,
        freeBenefitSource,
        agentInviteClaimId,
      }
    })
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
  findOne(outTradeNo: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.storeServiceOrder.findFirst({
      where: { outTradeNo }
    })
  }

  // 按允许的原状态条件更新订单，保证取消和完成操作只成功一次
  updateStatusWhen(
    outTradeNo: string,
    fromStatuses: ServiceOrderStatus[],
    status: ServiceOrderStatus,
    tx: Prisma.TransactionClient,
  ) {
    // 1. 状态不匹配时影响行数为0，由业务层进行幂等或冲突处理
    const data: Prisma.StoreServiceOrderUpdateManyMutationInput = { status }
    if (status === ServiceOrderStatus.CANCELLED) data.cancelledAt = new Date()
    if (status === ServiceOrderStatus.COMPLETED) data.completedAt = new Date()
    return tx.storeServiceOrder.updateMany({
      where: { outTradeNo, status: { in: fromStatuses } },
      data,
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

    if (status === "PAID") {
      data.paidAt = new Date()
    }

    if (openid) {
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
