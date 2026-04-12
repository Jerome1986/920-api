import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class WxPhoneLoginDto {
  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  encryptedData: string

  @IsNotEmpty()
  iv: string

  @IsOptional() //
  @IsString()
  inviterCode?: string
}
