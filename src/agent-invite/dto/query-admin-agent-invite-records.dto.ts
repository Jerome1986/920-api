import { Transform, Type } from 'class-transformer'
import { AgentInviteBenefitStatus } from '@prisma/client'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator'

const emptyToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  return normalized === '' ? undefined : normalized
}

// 后台按目标代理用户 ID 查询邀请记录，暂不接入管理员鉴权
export class QueryAdminAgentInviteRecordsDto {
  @IsString({ message: '代理用户ID必须是字符串' })
  @IsNotEmpty({ message: '缺少代理用户ID' })
  userId: string = ''

  @Transform(emptyToUndefined)
  @IsOptional()
  @Matches(/^(?:\d{4}|\d{11})$/, { message: '手机号必须是完整11位手机号或后四位数字' })
  mobile?: string

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsEnum(AgentInviteBenefitStatus, { message: '权益状态参数不正确' })
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
  @Max(50, { message: 'pageSize不能大于50' })
  pageSize?: number
}
