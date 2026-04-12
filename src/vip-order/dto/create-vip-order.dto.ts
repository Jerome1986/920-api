import { IsInt, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateVipOrderDto {
  @IsString()
  openid: string

  // 用户ID
  @IsString()
  userId: string

  // 手机号
  @IsString()
  userMobile: string

  // 关联的VIP套餐ID
  @Type(() => Number)
  @IsInt()
  vipProId: number

  // 会员等级
  @Type(() => Number)
  @IsInt()
  vipLevel: number

  // 会员名称
  @IsString()
  vipLevelText: string

  // 支付金额
  @Type(() => Number)
  @IsNumber()
  amount: number

  // 折扣金额
  @Type(() => Number)
  @IsNumber()
  discount: number

  // 限制次数
  @Type(() => Number)
  @IsInt()
  limit: number

  // 最大用户数
  @Type(() => Number)
  @IsInt()
  maxUsers: number

  // 有效期天数
  @IsString()
  term: string

  @IsOptional()
  @IsString()
  remark: string
}
