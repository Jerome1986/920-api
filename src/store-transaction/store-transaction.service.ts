import { Injectable } from "@nestjs/common";
import { StoreTransactionRepository } from "./store-transaction.repository";
import { StoreTransactionFilterType, TimeRangePreset } from "./dto/query-store-transaction.dto";

@Injectable()
export class StoreTransactionService {
  constructor(private storeTransactionRepo: StoreTransactionRepository) { }

  // 获取门店业务流水
  async storeTransactionById(
    storeId: string,
    filterType: StoreTransactionFilterType | undefined,
    timeRangePreset: TimeRangePreset | undefined,
    pageNum: number,
    pageSize: number
  ) {
    const [list, total] = await this.storeTransactionRepo.storeTransactionById(
      storeId,
      filterType,
      timeRangePreset,
      pageNum,
      pageSize
    )

    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }
}
