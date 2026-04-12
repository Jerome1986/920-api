import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateProductImageDto } from './dto/create-product-image.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ProductImageRepository {
  constructor(private prisma: PrismaService) {}

  // 新增C端商品详情图
  async createMany(productId: number, dto: CreateProductImageDto[], tx: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    const data = dto.map((i) => ({
      productId,
      url: i.url,
    }))
    return await db.productImage.createMany({ data })
  }

  // 删除该产品下所有详情图
  async deleteMany(productId: number, tx: Prisma.TransactionClient) {
    return await tx.productImage.deleteMany({ where: { productId } })
  }
}
