import { Injectable, Query } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Prisma } from '@prisma/client'
import { QueryTarget } from 'src/category/dto/create-tcategory.dto'

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) { }

  // 获取热门商品
  async findHot(pageNum: number, pageSize: number, target: QueryTarget) {
    return await Promise.all([
      this.prisma.product.findMany({
        where: { target, hot: 'ENABLE' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { images: true, models: true, skus: true },
      }),
      this.prisma.product.count({ where: { hot: 'ENABLE' } }),
    ])
  }

  // 根据分类、货号、名称搜索商品--后台管理
  async searchAll(categoryId, searchVal, pageNum, pageSize, target: QueryTarget) {
    let where: any = {
      target,
      OR: [{ name: { contains: searchVal } }, { skuNo: { contains: searchVal } }],
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    return await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { skus: true, images: true, models: true },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where }),
    ])
  }

  // 根据货号/名称搜索商品--前端搜索
  searchValue(searchVal: string, pageNum: number, pageSize: number, target: QueryTarget) {
    let where: any = {
      target,
      AND: [
        {
          OR: [{ name: { contains: searchVal } }, { skuNo: { contains: searchVal } }],
        },
      ],
    }
    return Promise.all([
      this.prisma.product.findMany({
        where,
        include: { skus: true, images: true, models: true },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ])
  }

  // 新增商品
  async create(dto: CreateProductDto, tx: Prisma.TransactionClient) {
    const { images, models, skus, ...items } = dto
    return await tx.product.create({ data: items })
  }

  // 点击更新阅读量
  async autoLookNum(productId: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { lookNum: { increment: 1 } },
    })
  }

  // 根据商品类型来获取所有商品（TOB/TOC）
  async findAllByTarget(categoryId: number, target: QueryTarget, pageNum: number, pageSize: number) {
    let where: any = {
      target
    }
    if (categoryId) {
      where.categoryId = categoryId
    }
    return await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { skus: true, images: true, models: true, category: true },
        orderBy: { skuNo: 'asc' }
      }),
      this.prisma.product.count({ where })
    ])
  }

  // 根据分类ID获取
  async findAll(categoryId: number, pageNum: number, pageSize: number, target: QueryTarget) {
    return await Promise.all([
      this.prisma.product.findMany({
        where: { categoryId, target },
        include: { skus: true, images: true, models: true },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where: { categoryId } }),
    ])
  }

  // 查找指定商品
  async findOne(productId: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return await db.product.findFirst({
      where: { id: productId },
    })
  }

  // 获取商品详情
  async findDetail(productId: number) {
    return await this.prisma.product.findFirst({
      where: { id: productId },
      include: { images: true, models: true, skus: true },
    })
  }

  // 根据ID更新C端商品
  async update(productId: number, dto: UpdateProductDto, tx: Prisma.TransactionClient) {
    const { images, models, skus, ...items } = dto
    return await tx.product.update({
      where: { id: productId },
      data: items,
    })
  }

  // 删除指定商品
  async remove(productId: number) {
    return await this.prisma.product.delete({ where: { id: productId } })
  }
}
