import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateTocCategoryDto {
  @IsString()
  @IsNotEmpty({ message: '分类名称不可以为空' })
  name: string

  @IsOptional()
  @IsNumber()
  sort: number
}

