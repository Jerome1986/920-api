// auth.controller.ts
import { Body, Controller, Headers, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { WxPhoneLoginDto } from './dto/wx-phone-login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wx-phone-login')
  async wxPhoneLogin(@Body() dto: WxPhoneLoginDto, @Headers() headers: Record<string, any>) {
    console.log('wxlogin', dto)
    console.log('header', headers)
    return this.authService.wxPhoneLogin(dto)
  }
}
