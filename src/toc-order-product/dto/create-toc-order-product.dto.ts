import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateTocOrderProductDto {
  @IsNumber()
  @IsNotEmpty({ message: '商品ID不可以为空' })
  productId: number

  @IsOptional()
  @IsString()
  model: string

  @IsString()
  @IsNotEmpty({ message: '缺少商品货号' })
  skuNo: string

  @IsString()
  @IsNotEmpty({ message: '缺少商品名称' })
  name: string

  @IsString()
  @IsNotEmpty({ message: '缺少商品价格' })
  price: string

  @IsNumber()
  @IsNotEmpty({ message: '缺少商品数量' })
  quantity: number

  @IsString()
  @IsNotEmpty({ message: '缺少商品封面图' })
  image: string

  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: '缺少对应的SKUID' })
  skuId?: number

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '缺少规格名称' })
  skuName?: string
}
