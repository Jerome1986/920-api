import { Injectable } from '@nestjs/common';
import { StoreInventoryRepositroy } from './store-inventory.repository';
import { SearchStoreInventoryDto } from './dto/search-store-inventory-dto';

@Injectable()
export class StoreInventoryService {
  constructor(private storeInventoryRepo: StoreInventoryRepositroy) { }

  // 根据当前分类获取当前门店库存
  async findAllByStoreWithCategory(storeId: string, categoryId: number, pageNum: number, pageSize: number) {
    const [res, total] = await this.storeInventoryRepo.findAllByStoreWithCategory(storeId, categoryId)

    // 重组数据
    const list = res.map(l => {
      const { sku, ...items } = l
      return {
        ...items,
        productName: sku.product.name,
        productDec: sku.product.dec,
        productId: sku.product.id,
        cover: sku.image,
        skuNo: l.sku.product.skuNo,
        minStock: sku.minStock,
        models: l.sku.product.models
      }
    })
      .sort((a, b) => this.compareSkuNo(a.skuNo, b.skuNo))

    const start = (pageNum - 1) * pageSize
    const pagedList = list.slice(start, start + pageSize)

    return {
      list: pagedList,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 根据关键词和分类搜索库存商品
  async searchWithCategory(searchStoreInventoryDto: SearchStoreInventoryDto) {
    const list = await this.storeInventoryRepo.searchWithCategory(searchStoreInventoryDto)
    const res = list.map(l => {
      const { sku, ...items } = l
      return {
        ...items,
        productName: sku.product.name,
        productDec: sku.product.dec,
        productId: sku.product.id,
        cover: sku.image,
        skuNo: l.sku.product.skuNo,
        minStock: sku.minStock,
        models: l.sku.product.models
      }
    })

    return res
  }

  // 减少门店库存
  async decrementStoreStock(storeId: string, skuId: number, quantity: number) {
    return this.storeInventoryRepo.decrementStock(storeId, skuId, quantity)
  }

  private compareSkuNo(a?: string, b?: string) {
    const left = this.splitSkuNo(a ?? '')
    const right = this.splitSkuNo(b ?? '')
    const length = Math.max(left.length, right.length)

    for (let i = 0; i < length; i++) {
      const leftPart = left[i]
      const rightPart = right[i]

      if (!leftPart) return -1
      if (!rightPart) return 1

      if (leftPart.typeOrder !== rightPart.typeOrder) {
        return leftPart.typeOrder - rightPart.typeOrder
      }

      const result = leftPart.typeOrder === 1
        ? this.compareNumberPart(leftPart.value, rightPart.value)
        : leftPart.value.toLowerCase().localeCompare(rightPart.value.toLowerCase())

      if (result !== 0) return result
    }

    return (a ?? '').localeCompare(b ?? '')
  }

  private splitSkuNo(skuNo: string) {
    return (skuNo.match(/[A-Za-z]+|\d+|[^A-Za-z\d]+/g) ?? []).map(value => ({
      value,
      typeOrder: /^\d+$/.test(value) ? 1 : (/^[A-Za-z]+$/.test(value) ? 0 : 2)
    }))
  }

  private compareNumberPart(a: string, b: string) {
    const normalizedA = a.replace(/^0+/, '') || '0'
    const normalizedB = b.replace(/^0+/, '') || '0'

    if (normalizedA.length !== normalizedB.length) {
      return normalizedA.length - normalizedB.length
    }

    const valueCompare = normalizedA.localeCompare(normalizedB)
    if (valueCompare !== 0) return valueCompare

    return b.length - a.length
  }
}
