import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class VipExpireTask {
  constructor(private prisma: PrismaService) {}

  // 定时每晚12点检查会员是否过期
  @Cron('0 0 0 * * *')
  async handleVipExpire() {
    const now = new Date()

    await this.prisma.user.updateMany({
      where: {
        vipEndTime: { lt: now },
        role: 'VIP',
      },
      data: {
        role: 'USER',
      },
    })
  }
}
