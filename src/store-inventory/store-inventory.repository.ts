import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStoreInventoryDto } from "./dto/create-store-inventory.dto";
import { Prisma } from "@prisma/client";
import { SearchStoreInventoryDto } from "./dto/search-store-inventory-dto";
import { normalize } from "src/utils/normalize";

@Injectable()
export class StoreInventoryRepositroy {
  constructor(private prisma: PrismaService) { }

  // 根据当前分类获取当前门店库存
  async findAllByStoreWithCategory(storeId: string, categoryId: number, pageNum: number, pageSize: number) {
    let where: any = { storeId }
    if (categoryId) where.categoryId = categoryId

    return await Promise.all([
      this.prisma.storeInventory.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { sku: { include: { product: { include: { models: true } } } } }
      }),
      this.prisma.storeInventory.count({ where })
    ])
  }

  // 批量增加门店库存
  createMany(createStoreInventoryDto: CreateStoreInventoryDto[], tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.storeInventory.createMany({ data: createStoreInventoryDto })
  }

  // 根据关键词和分类搜索库存商品
  searchWithCategory(searchStoreInventoryDto: SearchStoreInventoryDto) {
    const { storeId, categoryId, keyword } = searchStoreInventoryDto
    console.log('keyword', keyword)

    return this.prisma.storeInventory.findMany({
      where: {
        storeId,
        categoryId,
        sku: {
          product: {
            models: {
              some: { name: { contains: keyword.trim().replace(/\s+/g, '').toLocaleLowerCase() } },
            },
          },
        },
      },
      include: { sku: { include: { product: { include: { models: true } } } } }
    })
  }
}