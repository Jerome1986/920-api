import { Injectable } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateStoreServiceOrderDto } from "./dto/create-store-service-order.dto"
import { generateOrderNo } from "src/utils/generateOrderNo"
import { ServiceOrderStatus } from "@prisma/client"


@Injectable()
export class StoreServiceOrderRepository {
  constructor(private prisma: PrismaService) { }

  // 创建订单
  create(createStoreServiceOrderDto: CreateStoreServiceOrderDto) {
    const outTradeNo = generateOrderNo('SERVICE')
    return this.prisma.storeServiceOrder.create({ data: { outTradeNo, ...createStoreServiceOrderDto } })
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