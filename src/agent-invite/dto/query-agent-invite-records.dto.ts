import { Transform, Type } from 'class-transformer'
import { AgentInviteBenefitStatus } from '@prisma/client'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator'

const emptyToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  return normalized === '' ? undefined : normalized
}

export class QueryAgentInviteRecordsDto {
  @IsString({ message: '用户ID必须是字符串' })
  @IsNotEmpty({ message: '缺少用户ID' })
  userId: string = ''

  @Transform(emptyToUndefined)
  @IsOptional()
  @Matches(/^(?:\d{4}|\d{11})$/, { message: '手机号必须是完整11位手机号或后四位数字' })
  mobile?: string

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEnum(AgentInviteBenefitStatus, { message: '权益状态错误' })
  benefitStatus?: AgentInviteBenefitStatus

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  pageNum?: number

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数不能小于1' })
  @Max(50, { message: '每页条数不能超过50' })
  pageSize?: number
}
