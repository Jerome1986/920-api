import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { AuthRepository } from './auth.repository'
import { WxUtil } from 'src/utils/wx.util'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET ?? 'jerome1986',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, WxUtil, UserRepository, PointsFlowRepository],
})
export class AuthModule {}
