import { AgentStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

// 后台启用或停用代理资格参数
export class UpdateAgentStatusDto {
  // 目标状态：ACTIVE 启用，DISABLED 停用
  @IsEnum(AgentStatus, { message: '代理状态错误' })
  status: AgentStatus

  // 操作管理员 ID，停用时记录到 disabledBy
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '操作管理员ID必须是整数' })
  @Min(1, { message: '操作管理员ID错误' })
  operatorId?: number

  // 停用原因，最多 200 个字符
  @IsOptional()
  @IsString({ message: '停用原因必须是字符串' })
  @MaxLength(200, { message: '停用原因不能超过200个字符' })
  disabledReason?: string
}
