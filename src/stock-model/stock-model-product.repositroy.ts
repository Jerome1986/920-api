import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StockModelProductData } from "./dto/create-stock-model.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class StockModelPorductRepository {
  constructor(private prisma: PrismaService) { }

  createMany(data: StockModelProductData[], tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma
    return db.stockModelProduct.createMany({
      data
    })
  }

  deleteMany(stockModelId: number, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma
    return db.stockModelProduct.deleteMany({ where: { stockModelId } })
  }
}