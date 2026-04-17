import { IsNotEmpty, IsOptional, IsPostalCode, IsString } from 'class-validator'

export class CreateOrderAddressDto {
  @IsString()
  @IsNotEmpty({ message: '收件人姓名不能为空' })
  name: string

  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  // @Matches(/^\d{6,20}$/, { message: '手机号格式不正确' })
  mobile: string

  @IsString()
  @IsNotEmpty({ message: '省不能为空' })
  province: string

  @IsString()
  @IsNotEmpty({ message: '市不能为空' })
  city: string

  @IsString()
  @IsNotEmpty({ message: '区/县不能为空' })
  county: string

  @IsOptional()
  @IsPostalCode('any', { message: '邮政编码格式不正确' })
  postalCode?: string

  @IsOptional()
  @IsString()
  nationalCode?: string

  @IsString()
  @IsNotEmpty({ message: '详细地址不能为空' })
  detail: string
}
