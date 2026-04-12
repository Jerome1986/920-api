import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common'
import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { QueryTarget } from 'src/category/dto/create-tcategory.dto'
import { QueryProductDto } from './dto/query-product-dto'

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }
  // 获取热门商品
  @Get('hot')
  async findHot(@Query() query: { pageNum: number; pageSize: number; target: QueryTarget }) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.productService.findHot(pageNum, pageSize, query.target)
  }

  // 获取商品详情
  @Get('detail/:productId')
  async findDetail(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.findDetail(productId)
  }

  // 添加商品--事务
  @Post('add')
  async create(@Body() createTocProductDto: CreateProductDto) {
    return this.productService.create(createTocProductDto)
  }

  // 自动更新产品的阅读量
  @Patch('look/:productId')
  async autoLookNum(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.autoLookNum(productId)
  }

  // 根据商品类型来获取所有商品（TOB/TOC）
  @Get('target/:categoryId')
  async findAllByTarget(@Param('categoryId') categoryId: string, @Query() queryDto: QueryProductDto) {
    const pageNum = Number(queryDto.pageNum) || 1
    const pageSize = Number(queryDto.pageSize) || 10
    return this.productService.findAllByTarget(+categoryId, queryDto.target, pageNum, pageSize)
  }

  // 根据货号/商品名称搜索商品--前端搜索 
  @Get('search')
  async searchValue(
    @Query() query: { searchVal: string, pageNum: string, pageSize: string, target: QueryTarget },
  ) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.productService.searchValue(query.searchVal, pageNum, pageSize, query.target)
  }

  // 根据分类ID货号名称搜索商品--后台管理
  @Get('search/:categoryId')
  async searchAll(
    @Param('categoryId') categoryId: string,
    @Query() query: { searchVal: string, pageNum: number, pageSize: number, target: QueryTarget },
  ) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.productService.searchAll(+categoryId, query.searchVal, pageNum, pageSize, query.target)
  }

  // 根据分类获取商品带分页
  @Get(':categoryId')
  async findAll(
    @Param('categoryId') categoryId: string,
    @Query() query: { pageNum: string, pageSize: string, target: QueryTarget },
  ) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.productService.findAll(+categoryId, pageNum, pageSize, query.target)
  }

  // 更新商品
  @Patch(':productId')
  async update(
    @Param('productId') prodcutId: number,
    @Body() updateTocProductDto: UpdateProductDto,
  ) {
    return this.productService.update(prodcutId, updateTocProductDto)
  }

  // 删除指定商品
  @Delete(':productId')
  async delete(@Param('productId') prodcutId: number) {
    console.log(prodcutId)
    return this.productService.delete(prodcutId)
  }
}
