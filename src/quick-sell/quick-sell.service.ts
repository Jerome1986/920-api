import { Injectable } from '@nestjs/common'
import { QuickSellRepository } from './quick-sell.repository'

@Injectable()
export class QuickSellService {
  constructor(private quickSellRepo: QuickSellRepository) {}

  async modelList(searchVal: string) {
    const keyword = searchVal.trim().toLocaleLowerCase()
    const list = await this.quickSellRepo.findInventoryModels(searchVal)
    const names = list.flatMap((item) =>
      item.sku.product.models
        .map((model) => model.name?.trim())
        .filter((name) => !keyword || name?.toLocaleLowerCase().includes(keyword))
        .filter((name): name is string => Boolean(name)),
    )

    return [...new Set(names)].sort((a, b) => a.localeCompare(b))
  }
}
