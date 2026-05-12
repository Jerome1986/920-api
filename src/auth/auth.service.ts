// auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthRepository } from './auth.repository'
import { WxUtil } from 'src/utils/wx.util'
import { WxPhoneLoginDto } from './dto/wx-phone-login.dto'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly wxUtil: WxUtil,
    private userRepo: UserRepository,
    private pointsFlowRepo: PointsFlowRepository,
  ) { }

  // auth.service.ts
  async wxPhoneLogin(dto: WxPhoneLoginDto) {
    const { code, phoneCode, inviterCode } = dto

    // 1️.获取 openid
    const { openid, session_key } = await this.wxUtil.getSession(code)

    // 2️.解密手机号
    const mobile = await this.wxUtil.getPhoneNumber(phoneCode)

    // 3️.查当前用户
    let user = await this.repo.findUser(openid, mobile)

    // 4.查邀请人
    let inviterId: string | null = null
    if (inviterCode) {
      const inviter = await this.userRepo.findByReferralCode(inviterCode)

      if (!inviter) {
        throw new BadRequestException('邀请码无效')
      }

      if (inviter.openid === openid) {
        throw new BadRequestException('不能邀请自己')
      }

      inviterId = inviter.id
    }

    // 5.用户不存在 → 创建
    if (!user) {
      user = await this.repo.createUser({
        openid,
        mobile,
        inviterId
      })

      // 5.1 注册奖励
      if (inviterId) {
        const inviter = await this.userRepo.updateUserIncScore(inviterId, 10)

        // 5.2.追加积分流水
        await this.pointsFlowRepo.create({
          userId: inviterId,
          type: 'INCOME',
          amount: 10,
          balance: inviter.score,
          source: '邀请好友',
        })
      }
    }

    // 6.生成 token（带角色）
    const token = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      type: 'user',
    })

    return {
      token,
      user,
    }
  }
}
