import { IsNotEmpty, IsString } from 'class-validator'

/** 商品适用型号项（仅 name；productId 由商品接口/事务里传入） */
export class CreateProductModelDto {
  @IsString()
  @IsNotEmpty({ message: '型号名称不可以为空' })
  name: string
}
