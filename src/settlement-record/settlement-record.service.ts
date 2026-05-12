import { Injectable } from "@nestjs/common";
import { SettlementRecordRepository } from "./settlement-record.repository";
import { QuerySettlementStatus } from "./dto/query-settlement-record.dto";

@Injectable()
export class SettlementRecordService {
  constructor(private repo: SettlementRecordRepository) { }

  // 获取所有的结算列表
  async findAll(
    status: QuerySettlementStatus,
    pageNum: number,
    pageSize: number,
    keyword: string,
    createdStartAt?: string,
    createdEndAt?: string
  ) {
    const [list, total] = await this.repo.findAll(status, pageNum, pageSize, keyword, createdStartAt, createdEndAt)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }
}
