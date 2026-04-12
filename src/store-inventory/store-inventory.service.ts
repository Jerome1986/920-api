import { Injectable } from '@nestjs/common';
import { StoreInventoryRepositroy } from './store-inventory.repository';
import { SearchStoreInventoryDto } from './dto/search-store-inventory-dto';

@Injectable()
export class StoreInventoryService {
  constructor(private storeInventoryRepo: StoreInventoryRepositroy) { }

  // 根据当前分类获取当前门店库存
  async findAllByStoreWithCategory(storeId: string, categoryId: number, pageNum: number, pageSize: number) {
    const [res, total] = await this.storeInventoryRepo.findAllByStoreWithCategory(storeId, categoryId, pageNum, pageSize)

    // 重组数据
    const list = res.map(l => {
      const { sku, ...items } = l
      return {
        ...items,
        productName: sku.product.name,
        productDec: sku.product.dec,
        skuNo: l.sku.product.skuNo,
        minStock: sku.minStock,
        models: l.sku.product.models
      }
    })

    return {
      list,
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
        skuNo: l.sku.product.skuNo,
        minStock: sku.minStock,
        models: l.sku.product.models
      }
    })

    return res
  }
}
