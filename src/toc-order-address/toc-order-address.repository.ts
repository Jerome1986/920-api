import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTocOrderAddressDto } from './dto/create-toc-order-address.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class TocOrderAddressRepository {
  constructor(private prisma: PrismaService) { }

  // 创建商品订单地址
  createOrderAddress(
    orderId: string,
    orderAddressDto: CreateTocOrderAddressDto,
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
