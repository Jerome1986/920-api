import { ApplyType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateJobApplyDto {
  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  mobile: string

  @IsString()
  @IsNotEmpty()
  icCardFont: string

  @IsString()
  @IsNotEmpty()
  icCardBack: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  business?: string

  @IsEnum(ApplyType)
  type: ApplyType
}
