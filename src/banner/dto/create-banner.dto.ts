import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateBannerDto {
  @IsString({ message: '必须是字符串' })
  @IsNotEmpty({ message: '不能为空' })
  url: string

  @IsNumber()
  sort: number
}
