import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateTocCategoryDto, QueryTarget } from './dto/create-tcategory.dto'
import { UpdateTocCategoryDto } from './dto/update-category.dto'
import { QueryCategoryDto } from './dto/query-category-dto'

@Controller('category')
export class CategoryController {
  constructor(private readonly tocCategoryService: CategoryService) { }

  // 新增分类
  @Post('add')
  async create(@Body() dto: CreateTocCategoryDto) {
    return this.tocCategoryService.create(dto)
  }

  // 根据TOC/TOB来获取所有分类
  @Get('tree')
  async categoryTree(@Query('target') target: QueryTarget) {
    console.log('target', target)

    return this.tocCategoryService.categoryTree(target)
  }

  // 根据层级获取分类
  @Get()
  async findAll(@Query() query: QueryCategoryDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    const parentId = Number(query.parentId) || 0
    const level = Number(query.level) || 1
    return this.tocCategoryService.findAll(pageNum, pageSize, parentId, level, query.target)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tocCategoryService.findOne(+id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTocCategoryDto) {
    return this.tocCategoryService.update(+id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tocCategoryService.remove(+id)
  }
}
