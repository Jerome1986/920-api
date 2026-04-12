import { IsNotEmpty, IsString } from 'class-validator'

export class CreatePhoneModelDto {
  @IsString()
  @IsNotEmpty({ message: '型号名称不可为空' })
  name: string
}
