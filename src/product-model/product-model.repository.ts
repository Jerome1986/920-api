import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateProductModelDto } from './dto/create-product-model.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class ProductModelRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(productId: number, dto: CreateProductModelDto[], tx: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    const data = dto.map((d) => ({ productId, name: d.name }))
    return await db.productModel.createMany({ data })
  }

  async deleteMany(productId: number, tx: Prisma.TransactionClient) {
    return await tx.productModel.deleteMany({ where: { productId } })
  }
}
