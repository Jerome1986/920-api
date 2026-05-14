import { BadRequestException, Controller, Get, Param, Query } from "@nestjs/common";
import { StoreTransactionService } from "./store-transaction.service";
import { QueryStoreTransactionDto, TimeRangePreset } from "./dto/query-store-transaction.dto";

@Controller('storeTransaction')
export class StoreTransactionController {
  constructor(private storeTransactionService: StoreTransactionService) { }

  // 根据时间和类型获取门店业务流水
  @Get(':storeId')
  async storeTransactionById(
    @Param('storeId') storeId: string,
    @Query() queryStoreTransactionDto: QueryStoreTransactionDto
  ) {
    if (!storeId) throw new BadRequestException('缺少门店ID')
    const pageNum = Number(queryStoreTransactionDto.pageNum) || 1
    const pageSize = Number(queryStoreTransactionDto.pageSize) || 10
    const filterType = queryStoreTransactionDto.filterType
    const timeRangePreset = queryStoreTransactionDto.timeRangePreset

    return this.storeTransactionService.storeTransactionById(storeId, filterType, timeRangePreset, pageNum, pageSize)
  }
}