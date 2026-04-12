import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStockModelDto } from './dto/create-stock-model.dto';
import { StockModelRepository } from './stock-model.repositroy';
import { StockModelPorductRepository } from './stock-model-product.repositroy';
import { UpdateStockModelDto } from './dto/update-stock-model.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockModelService {
  constructor(
    private repo: StockModelRepository,
    private smpRepo: StockModelPorductRepository,
    private prisma: PrismaService
  ) { }

  // 新增库存模版
  async create(createStockModelDto: CreateStockModelDto) {
    // 1.创建模版
    const stockModel = await this.repo.create(createStockModelDto)
    // 组合参数
    const data = createStockModelDto.items.map(i => ({
      stockModelId: stockModel.id,
      categoryId: i.categoryId,
      productId: i.productId,
      skuId: i.skuId,
      initStock: i.initStock || 0
    }))

    // 2.创建中间表
    await this.smpRepo.createMany(data)

    return stockModel
  }

  // 更新库存模版
  async updateOne(stockModelId: number, updateStockModelDto: UpdateStockModelDto) {
    try {
      const reuslt = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.更新模版名称
        const stockModel = await this.repo.updateOne(stockModelId, updateStockModelDto, tx)
        // 2.组合参数
        const data = updateStockModelDto.items!.map(i => ({
          stockModelId,
          categoryId: i.categoryId,
          productId: i.productId,
          skuId: i.skuId,
          initStock: i.initStock || 0
        }))

        console.log('data', data)

        // 3.删除再创建
        await this.smpRepo.deleteMany(stockModelId, tx)
        await this.smpRepo.createMany(data, tx)

        return stockModel
      })

      return reuslt
    } catch (err) {
      console.error(err)
      throw new BadRequestException('更新错误')
    }
  }

  async findAll() {
    return this.repo.findAll()
  }

  async findOne(stockModelId: number) {
    return this.repo.finOne(stockModelId)
  }

  async deleteOne(stockModelId: number) {
    return this.repo.deleteOne(stockModelId)
  }
}
