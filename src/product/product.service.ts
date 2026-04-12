import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductRepository } from './product.repository'
import { ProductModelRepository } from 'src/product-model/product-model.repository'
import { ProductImageRepository } from 'src/product-image/product-image.repository'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProductSkuRepository } from '../product-sku/product-sku.repository'
import { CreateProductSkuNestedDto } from '../product-sku/dto/create-product-sku.dto'
import { Prisma } from '@prisma/client'
import { QueryTarget } from 'src/category/dto/create-tcategory.dto'
import { CategoryRepository } from 'src/category/category.repository'

@Injectable()
export class ProductService {
  constructor(
    private repo: ProductRepository,
    private modelRepo: ProductModelRepository,
    private imageRepo: ProductImageRepository,
    private skuRepo: ProductSkuRepository,
    private categoryRopo: CategoryRepository,
    private prisma: PrismaService,
  ) { }

  // 获取热门商品
  async findHot(pageNum: number, pageSize: number, target: QueryTarget) {
    const [list, total] = await this.repo.findHot(pageNum, pageSize, target)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 获取商品详情
  findDetail(productId) {
    return this.repo.findDetail(productId)
  }

  // 根据分类、货号、名称搜索商品--后台管理
  async searchAll(categoryId, searchVal, pageNum, pageSize, target: QueryTarget) {
    const [list, total] = await this.repo.searchAll(categoryId, searchVal, pageNum, pageSize, target)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 根据货号/名称搜索商品--前端搜索
  async searchValue(searchVal: string, pageNum: number, pageSize: number, target: QueryTarget) {
    const [list, total] = await this.repo.searchValue(searchVal, pageNum, pageSize, target)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 添加商品--事务
  async create(dto: CreateProductDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1.根据分类添加商品
      const product = await this.repo.create(dto, tx)

      // 2.添加商品图片表
      if (dto.images?.length) {
        await this.imageRepo.createMany(product.id, dto.images, tx)
      }

      // 3.对应商品的型号表
      if (dto.models?.length) {
        await this.modelRepo.createMany(product.id, dto.models, tx)
      }

      // 4.添加SKU
      if (dto.skus?.length) {
        await this.skuRepo.createMany(product.id, dto.skus, tx)
      }
      return product
    })
    return {
      insertedId: result.id,
    }
  }

  // 点击更新阅读量
  async autoLookNum(productId: number) {
    return await this.repo.autoLookNum(productId)
  }

  // 根据商品类型来获取所有商品（TOB/TOC）
  async findAllByTarget(categoryId: number, target: QueryTarget, pageNum: number, pageSize: number) {
    const [list, total] = await this.repo.findAllByTarget(categoryId, target, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 根据分类获取商品
  async findAll(categoryId: number, pageNum: number, pageSize: number, target: QueryTarget) {

    const [rows, total] = await this.repo.findAll(categoryId, pageNum, pageSize, target)
    const list = rows.map((p) => ({
      ...p,
      salePrice: p.skus.find(s => s.unit === '片')?.salePrice,
      stockTotal: p.skus.reduce((sum, sku) => sum + sku.stock, 0),
    }))

    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 更新C端商品
  async update(prodcutId: number, dto: UpdateProductDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1.确定商品是否存在
      const product = await this.repo.findOne(prodcutId, tx)
      if (!prodcutId) throw new BadRequestException('该商品不存在')
      // 2.更新商品
      await this.repo.update(prodcutId, dto, tx)
      // 3.更新SKU
      // dto.skus === undefined：本次不处理 SKU；[]：清空全部 SKU；非空：diff 增删改
      if (dto.skus !== undefined) {
        if (dto.skus.length === 0) {
          const oldSkus = await this.skuRepo.findMany(prodcutId, tx)
          const oldIds = oldSkus.map((i) => i.id)
          if (oldIds.length) {
            await this.skuRepo.deleteManyByIds(prodcutId, oldIds, tx)
          }
        } else {
          const oldSkus = await this.skuRepo.findMany(prodcutId, tx)
          const oldMap = new Map(oldSkus.map((i) => [i.id, i]))
          const oldIds = oldSkus.map((i) => i.id)
          const newIds = dto.skus.filter((s) => s.id).map((s) => s.id)

          const toDeleteIds = oldIds.filter((id) => !newIds.includes(id))

          const updateTasks: Promise<any>[] = []
          const toCreateSku: CreateProductSkuNestedDto[] = []

          for (const s of dto.skus) {
            if (!s.id) {
              toCreateSku.push({
                costPrice: s.costPrice as number,
                salePrice: s.salePrice as number,
                stock: s.stock,
                minStock: s.minStock as number,
                image: s.image,
                attrs: s.attrs as Prisma.InputJsonValue,
                unit: s.unit,
              })
              continue
            }

            const old = oldMap.get(s.id)
            if (!old) continue

            // 判断「旧数据」和「新数据」之间，有没有发生任何变化 → 只要有一个地方变了，就返回 true，表示 “已修改”。
            const isChanged =
              old.costPrice?.toNumber() !== (s.costPrice ?? 0) ||
              old.salePrice?.toNumber() !== (s.salePrice ?? 0) ||
              old.stock !== s.stock ||
              old.minStock !== s.minStock ||
              old.image !== s.image ||
              old.unit !== s.unit ||
              JSON.stringify(old.attrs) !== JSON.stringify(s.attrs)

            if (isChanged) {
              updateTasks.push(
                this.skuRepo.update(
                  prodcutId,
                  {
                    id: s.id,
                    costPrice: s.costPrice as number,
                    salePrice: s.salePrice as number,
                    stock: s.stock,
                    minStock: s.minStock,
                    image: s.image,
                    attrs: s.attrs as Prisma.InputJsonValue,
                    unit: s.unit,
                  },
                  tx,
                ),
              )
            }
          }

          if (toDeleteIds.length) {
            updateTasks.push(this.skuRepo.deleteManyByIds(prodcutId, toDeleteIds, tx))
          }

          if (toCreateSku.length) {
            updateTasks.push(this.skuRepo.createMany(prodcutId, toCreateSku, tx))
          }

          await Promise.all(updateTasks)
        }
      }

      // 4.更新型号
      if (dto.models !== undefined) {
        await this.modelRepo.deleteMany(prodcutId, tx)
        if (dto.models.length > 0) {
          await this.modelRepo.createMany(prodcutId, dto.models, tx)
        }
      }
      // 5.更新详情图
      if (dto.images !== undefined) {
        await this.imageRepo.deleteMany(prodcutId, tx)
        if (dto.images.length > 0) {
          await this.imageRepo.createMany(prodcutId, dto.images, tx)
        }
      }
      return product
    })

    return result
  }

  // 删除指定商品
  async delete(prodcutId: number) {
    if (!prodcutId) throw new BadRequestException('参数错误')
    const product = await this.repo.findOne(prodcutId)
    if (!product) throw new BadRequestException('商品不存在')
    return await this.repo.remove(prodcutId)
  }
}
