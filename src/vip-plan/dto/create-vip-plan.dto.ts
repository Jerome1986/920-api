import { IsInt, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator'
import { commonStatus } from '@prisma/client' // 你的枚举
import { Type } from 'class-transformer'

export class CreateVipPlanDto {
  // 会员等级
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  level: number

  // 会员名称
  @IsString()
  levelText: string

  // 价格（Decimal 类型）
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price: number

  // 折扣（可选）
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount: number

  // 时长 365 等
  @IsString()
  term: string

  // 权益说明
  @IsString()
  rights: string

  // 状态：enable / disable
  @IsEnum(commonStatus)
  status: commonStatus

  // 返现比例
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cashbackRate: number

  // 最大用户数
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxUsers: number

  // 数量限制
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number
}
