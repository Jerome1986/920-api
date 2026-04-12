import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { commonStatus } from '@prisma/client'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  nickname: string

  @IsOptional()
  gender: number

  @IsOptional()
  @IsNumber()
  score: number

  @IsEnum(commonStatus, { message: '用户状态必须是有效的枚举值' })
  status: commonStatus
}
