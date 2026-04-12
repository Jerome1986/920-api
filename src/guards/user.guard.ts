import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()

    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('未登录')
    }

    const token = authHeader.replace('Bearer ', '')

    try {
      const user = this.jwtService.verify(token)

      // 👇 核心：挂载用户信息
      request.user = user

      // 👇 判断是不是用户端
      if (user.type !== 'user') {
        throw new UnauthorizedException('无权限')
      }

      return true
    } catch (e) {
      throw new UnauthorizedException('token无效')
    }
  }
}
