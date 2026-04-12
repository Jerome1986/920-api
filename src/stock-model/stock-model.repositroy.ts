import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStockModelDto } from "./dto/create-stock-model.dto";
import { UpdateStockModelDto } from "./dto/update-stock-model.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class StockModelRepository {
  constructor(private prisma: PrismaService) { }

  // 新增库存模版
  create(createStockModelDto: CreateStockModelDto) {
    return this.prisma.stockModel.create({
      data: {
        name: createStockModelDto.name
      }
    })
  }

  // 更新库存模版
  updateOne(stockModelId: number, updateStockModelDto: UpdateStockModelDto, tx?: Prisma.TransactionClient) {
    const db = tx || this.prisma
    return db.stockModel.update({
      where: { id: stockModelId },
      data: { name: updateStockModelDto.name }
    })
  }

  // 获取库存列表
  findAll() {
    return this.prisma.stockModel.findMany({
      include: { items: { include: { product: { include: { skus: true } } } } }
    })
  }

  // 获取库存模版详情
  finOne(stockModelId: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.stockModel.findUnique({
      where: { id: stockModelId },
      include: { items: { include: { product: true } } }
    })
  }

  // 获取库存模版里的SKU
  findSku(stockModelId: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.stockModel.findUnique({
      where: { id: stockModelId },
      include: { items: { include: { skus: true } } }
    })
  }

  // 删除库存模版
  deleteOne(stockModelId: number) {
    return this.prisma.stockModel.delete({ where: { id: stockModelId } })
  }
}