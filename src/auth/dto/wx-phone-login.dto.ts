import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class WxPhoneLoginDto {
  @IsString()
  code: string
  @IsString()
  phoneCode: string
  @IsString()
  @IsOptional()
  inviterCode?: string
}