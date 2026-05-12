import { Controller, Get, Query } from "@nestjs/common";
import { SettlementRecordService } from "./settlement-record.service";
import { QuerySettlementRecordDto, QuerySettlementStatus } from "./dto/query-settlement-record.dto";

@Controller('settlementRecord')
export class SettlementRecordController {
  constructor(private readonly settlementRecordService: SettlementRecordService) { }

  // 获取所有的结算列表
  @Get()
  async findAll(@Query() querySettlementRecordDto: QuerySettlementRecordDto) {
    const status = querySettlementRecordDto.status || QuerySettlementStatus.ALL
    const pageNum = Number(querySettlementRecordDto.pageNum) || 1
    const pageSize = Number(querySettlementRecordDto.pageSize) || 10
    const keyword = querySettlementRecordDto.keyword || ''
    const createdStartAt = querySettlementRecordDto.createdStartAt
    const createdEndAt = querySettlementRecordDto.createdEndAt

    return this.settlementRecordService.findAll(status, pageNum, pageSize, keyword, createdStartAt, createdEndAt)
  }
}
