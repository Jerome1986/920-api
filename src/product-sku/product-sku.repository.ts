import { Injectable } from '@nestjs/common'
import { CreateProductSkuNestedDto } from './dto/create-product-sku.dto'
import { Prisma } from '@prisma/client'
import { UpdateProductSkuDto } from './dto/update-product-sku.dto'

@Injectable()
export class ProductSkuRepository {
  async createMany(
    productId: number,
    skus: CreateProductSkuNestedDto[],
    tx: Prisma.TransactionClient,
  ) {
    const data = skus.map((s) => ({
      productId,
      costPrice: s.costPrice,
      salePrice: s.salePrice,
      stock: s.stock,
      minStock: s.minStock,
      image: s.image,
      attrs: s.attrs as Prisma.InputJsonValue,
      unit: s.unit,
    }))
    return await tx.productSku.createMany({ data })
  }

  // 更新单条SKU
  async update(productId: number, skus: UpdateProductSkuDto, tx: Prisma.TransactionClient) {
    return await tx.productSku.update({
      where: { id: skus.id, productId },
      data: {
        costPrice: skus.costPrice,
        salePrice: skus.salePrice,
        stock: skus.stock,
        minStock: skus.minStock,
        image: skus.image,
        attrs: skus.attrs as Prisma.InputJsonValue,
        unit: skus.unit,
      },
    })
  }

  // 批量查找SKU
  async findMany(productId: number, tx: Prisma.TransactionClient) {
    return await tx.productSku.findMany({
      where: { productId },
    })
  }

  // 根据ID批量删除
  async deleteManyByIds(productId: number, toDeleteIds: number[], tx: Prisma.TransactionClient) {
    return tx.productSku.deleteMany({
      where: {
        id: {
          in: toDeleteIds,
        },
        productId, // 👈 防止误删别的商品的SKU
      },
    })
  }

  async deleteMany(productId: number, tx: Prisma.TransactionClient) {
    return await tx.productSku.deleteMany({ where: { productId } })
  }
}
