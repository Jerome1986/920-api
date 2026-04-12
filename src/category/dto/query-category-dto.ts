import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { QueryTarget } from './create-tcategory.dto'

export class QueryCategoryDto {
  @IsOptional()
  @IsString()
  pageNum?: string
  @IsOptional()
  @IsString()
  pageSize?: string

  @IsOptional()
  @IsString()
  parentId?: string
  @IsString()
  level?: string

  @IsEnum(QueryTarget)
  target: QueryTarget
}
