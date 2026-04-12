// auth.repository.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import axios from 'axios'

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) { }

  // 查用户（核心逻辑）
  findUser(openid: string, mobile: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ openid }, { mobile }],
      },
    })
  }

  // 创建用户（注意默认值）
  createUser(data: {
    openid: string
    mobile: string
    inviterId?: string | null
  }) {
    return this.prisma.user.create({
      data: {
        openid: data.openid,
        mobile: data.mobile,
        referralCode: this.generateReferralCode(),
        nickname: '微信用户',
        avatarUrl: process.env.DEFAULT_AVATAR,
        inviterId: data.inviterId,
      },
    })
  }

  // 生成邀请码（简单版）
  private generateReferralCode() {
    return Math.random().toString(36).substring(2, 8)
  }

  // 获取微信接口凭证
  async getAccessToken() {
    // 全局变量缓存 access_token
    let cachedToken: { token: string; expiresAt: number } = { token: '', expiresAt: 0 }
    const now = Date.now()
    if (cachedToken && cachedToken.expiresAt > now) {
      return cachedToken.token
    }

    const tokenRes = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: process.env.APPID,
        secret: process.env.APPSECRET,
      },
    })

    const accessToken = tokenRes.data.access_token
    const expiresIn = tokenRes.data.expires_in

    if (!accessToken) throw new Error('获取 access_token 失败')

    cachedToken = {
      token: accessToken,
      expiresAt: now + (expiresIn - 300) * 1000, // 提前 5 分钟刷新
    }

    return accessToken
  }
}
