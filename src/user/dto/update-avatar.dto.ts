import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserAvatarDto {
  @IsString({ message: '用户名头像是字符串' })
  @IsNotEmpty({ message: '用户头像不能为空' })
  url: string
}
