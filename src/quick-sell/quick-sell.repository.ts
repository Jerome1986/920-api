import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class QuickSellRepository {
  constructor(private prisma: PrismaService) {}

  findInventoryModels(searchVal: string) {
    const keyword = searchVal.trim()
    const where: Prisma.StoreInventoryWhereInput = {}

    if (keyword) {
      where.sku = {
        product: {
          models: {
            some: {
              name: { contains: keyword },
            },
          },
        },
      }
    }

    return this.prisma.storeInventory.findMany({
      where,
      include: {
        sku: {
          include: {
            product: {
              include: {
                models: true,
              },
            },
          },
        },
      },
    })
  }
}
