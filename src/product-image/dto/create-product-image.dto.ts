import { IsNotEmpty, IsString } from 'class-validator'

/** 商品图片项（仅 url；productId 由商品接口/事务里传入） */
export class CreateProductImageDto {
  @IsString()
  @IsNotEmpty({ message: '图片链接不可为空' })
  url: string
}
