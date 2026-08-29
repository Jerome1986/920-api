import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateAgentProfileDto {
  @IsString({ message: '用户ID必须是字符串' })
  @IsNotEmpty({ message: '缺少用户ID' })
  userId: string

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(200, { message: '备注不能超过200个字符' })
  remark?: string
}
