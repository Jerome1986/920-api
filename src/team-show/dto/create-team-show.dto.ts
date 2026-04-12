import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTeamShowDto {
  @IsString({ message: '必须是字符串' })
  @IsNotEmpty({ message: '名称不能为空' })
  name: string
  @IsString({ message: '必须是字符串' })
  @IsNotEmpty({ message: '图片不能为空' })
  image: string
}
