import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

// 分类/商品目标枚举
export enum QueryTarget {
  TOC = 'TOC',
  TOB = 'TOB',
  ALL = 'ALL',
}

export class CreateTocCategoryDto {
  @IsString()
  @IsNotEmpty({ message: '分类名称不可以为空' })
  name: string
  
  @IsOptional()
  @IsNumber()
  parentId: number = 0

  @IsOptional()
  @IsNumber()
  level: number = 1

  @IsOptional()
  @IsNumber()
  sort: number = 0

  @IsOptional()
  @IsEnum(QueryTarget)
  target: QueryTarget
}
