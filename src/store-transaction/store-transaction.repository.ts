import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStoreTransactionDto } from "./dto/create-store-transaction.dto";
import { Prisma } from "@prisma/client";
import { StoreTransactionFilterType, TimeRangePreset } from "./dto/query-store-transaction.dto";

@Injectable()
export class StoreTransactionRepository {
  constructor(private prisma: PrismaService) { }

  // 创建门店流水
  create(createStoreTransactionDto: CreateStoreTransactionDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.storeTransaction.create({ data: createStoreTransactionDto })
  }


  // 获取门店业务流水
  async storeTransactionById(
    storeId: string,
    filterType: StoreTransactionFilterType,
    timeRangePreset: TimeRangePreset,
    pageNum: number,
    pageSize: number
  ) {
    const now = new Date()
    // 时间映射
    const timeRangeMap: Record<TimeRangePreset, Date> = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
      year: new Date(now.getFullYear(), 0, 1),
    }

    let where: any = {
      storeId,
      createdAt: {
        gte: timeRangeMap[timeRangePreset],
      },
    }

    if (filterType !== 'ALL') {
      where.type = filterType
    }
    console.log('query', where)


    return await Promise.all([
      this.prisma.storeTransaction.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.storeTransaction.count({ where })
    ])
  }
}