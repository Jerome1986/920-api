import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateOrderAddressDto } from './dto/create-order-address.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class OrderAddressRepository {
  constructor(private prisma: PrismaService) { }

  // 创建商品订单地址
  createOrderAddress(
    orderId: string,
    orderAddressDto: CreateOrderAddressDto,
    tx: Prisma.TransactionClient,
  ) {
    return tx.orderAddress.create({
      data: {
        orderId,
        name: orderAddressDto.name,
        mobile: orderAddressDto.mobile,
        province: orderAddressDto.province,
        city: orderAddressDto.city,
        county: orderAddressDto.county,
        postalCode: orderAddressDto.postalCode,
        nationalCode: orderAddressDto.nationalCode,
        detail: orderAddressDto.detail,
      },
    })
  }
}
