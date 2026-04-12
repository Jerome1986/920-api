import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTocCategoryDto, QueryTarget } from './dto/create-tcategory.dto'
import { UpdateTocCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) { }

  // 新增分类
  create(dto: CreateTocCategoryDto) {
    return this.prisma.category.create({ data: dto })
  }

  // 根据TOC/TOB来获取所有分类
  categoryTree(target: QueryTarget) {
    return this.prisma.category.findMany({
      where: { target },
      orderBy: { sort: 'asc' }
    })
  }

  // 根据层级显示分类数据
  async findAll(
    pageNum: number,
    pageSize: number,
    parentId: number,
    level: number,
    target: QueryTarget,
  ) {
    let where: any = {
      level,
      target,
    }
    if (parentId) {
      where.parentId = parentId
    }
    return await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ])
  }

  findOne(id: number) {
    return this.prisma.category.findFirst({ where: { id } })
  }

  update(id: number, dto: UpdateTocCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: number) {
    const cate = await this.prisma.category.delete({ where: { id } })
    return {
      id: cate.id,
    }
  }
}
