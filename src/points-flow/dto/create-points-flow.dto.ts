import { PointsFlowType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreatePointsFlowDto {
  @IsString()
  @IsNotEmpty({ message: '用户ID不可以为空' })
  userId: string

  @IsEnum(PointsFlowType)
  type: PointsFlowType

  @IsNumber()
  @IsNotEmpty({ message: '积分变动数量不可以为空' })
  amount: number

  @IsString()
  @IsNotEmpty({ message: '来源不可以为空' })
  source: string

  @IsNumber()
  @IsNotEmpty({ message: '积分变动后余额不可以为空' })
  balance: number
}
