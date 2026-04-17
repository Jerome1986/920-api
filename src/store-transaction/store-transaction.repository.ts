import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStoreTransactionDto } from "./dto/create-store-transaction.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class StoreTransactionRepository {
  constructor(private prisma: PrismaService) { }

  // 创建门店流水
  create(createStoreTransactionDto: CreateStoreTransactionDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.storeTransaction.create({ data: createStoreTransactionDto })
  }
}