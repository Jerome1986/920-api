import { Injectable } from '@nestjs/common'
import { CreateTocCategoryDto, QueryTarget } from './dto/create-tcategory.dto'
import { UpdateTocCategoryDto } from './dto/update-category.dto'
import { CategoryRepository } from './category.repository'

@Injectable()
export class CategoryService {
  constructor(private repo: CategoryRepository) { }

  // 新增分类
  async create(dto: CreateTocCategoryDto) {
    return await this.repo.create(dto)
  }

  // 根据TOC/TOB来获取所有分类
  async categoryTree(target: QueryTarget) {
    const tree: any[] = []
    const map = new Map()
    const list = await this.repo.categoryTree(target)
    list.forEach(l => map.set(l.id, { ...l, children: [] }))
    list.forEach(item => {
      const node = map.get(item.id)
      if (item.parentId) {
        const parent = map.get(item.parentId)
        parent.children.push(node)
      } else {
        tree.push(node)
      }
    })

    return tree
  }

  async findAll(
    pageNum: number,
    pageSize: number,
    parentId: number,
    level: number,
    target: QueryTarget,
  ) {
    const [list, total] = await this.repo.findAll(pageNum, pageSize, parentId, level, target)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  async findOne(id: number) {
    return await this.repo.findOne(id)
  }

  async update(id: number, dto: UpdateTocCategoryDto) {
    return await this.repo.update(id, dto)
  }

  async remove(id: number) {
    return await this.repo.remove(id)
  }
}
