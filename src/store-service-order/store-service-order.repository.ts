import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateStoreServiceOrderDto } from "./dto/create-store-service-order.dto"
import { generateOrderNo } from "src/utils/generateOrderNo"
import { ServiceOrderStatus } from "@prisma/client"
import { FreeStoreServiceOrderDto } from "./dto/free-store-service-order.dto"
import { UserRepository } from "src/user/user.repository"


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

  // 订单详情
  findOne(outTradeNo: string) {
    return this.prisma.storeServiceOrder.findFirst({
      where: { outTradeNo }
    })
  }

  // 更新订单状态
  updateOrder(outTradeNo: string, status: ServiceOrderStatus, openid?: string) {
    console.log(status)

    let data: any = {
      status
    }

    if (status === "CANCELLED") data.cancelledAt = new Date()
    if (status === "PAID" && openid) {
      data.paidAt = new Date()
      data.openid = openid
    }

    return this.prisma.storeServiceOrder.update({
      where: { outTradeNo },
      data
    })
  }
}