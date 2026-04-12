import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { QueryTarget } from 'src/category/dto/create-tcategory.dto'

export class BaseProductDto {
  @IsString()
  @IsNotEmpty({ message: '商品名称不可以为空' })
  name: string

  @IsString()
  @IsNotEmpty({ message: '商品货号不可以为空' })
  skuNo: string

  @IsOptional()
  @IsString()
  dec?: string

  @IsOptional()
  @IsString()
  cover: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lookNum?: number

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE'], { message: 'status 须为 ACTIVE 或 INACTIVE' })
  status?: string

  @IsOptional()
  @IsString()
  @IsIn(['ENABLE', 'DISABLE'], { message: 'hot 须为 ENABLE 或 DISABLE' })
  hot?: string

  @IsOptional()
  @IsString()
  @IsIn(['USER', 'MANAGER', 'VIP', 'BOTH'], {
    message: 'type 须为 USER ,MANAGER,VIP或 both',
  })
  type?: string

  @IsEnum(QueryTarget)
  target: QueryTarget

  @Type(() => Number)
  @IsInt({ message: '分类 id 须为整数' })
  categoryId: number

  @IsOptional()
  @IsString()
  categoryName: string
}
