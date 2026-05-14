import { Injectable, Post } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdateUserAvatarDto } from './dto/update-avatar.dto'
import { Prisma, userRole } from '@prisma/client'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) { }
  // 获取所有用户
  async findAll(pageNum: number, pageSize: number, role?: userRole) {
    let where: any = {}
    if (role) where.role = role

    return await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { inviter: true }
      }),
      this.prisma.user.count(),
    ])
  }

  // 根据ID批量查询用户
  findByIds(userIds: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: userIds } }
    })
  }

  // 获取指定用户信息
  async findOne(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return await db.user.findUnique({
      where: { id },
    })
  }

  // 根据openid获取用户信息
  findUserByOpenid(openid: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.findFirst({ where: { openid } })
  }

  // 根据门店ID查询店长的ID
  findUserIdByShop(storeId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.findFirst({ where: { storeId, role: { in: ['MANAGER_PRIMARY', 'MANAGER_SENIOR'] } } })
  }

  // 获取门店下的会员用户
  async storeByVip(inviterId: string, pageNum: number, pageSize: number) {
    return await Promise.all([
      this.prisma.user.findMany({
        where: { inviterId, role: 'VIP' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.user.count({ where: { inviterId, role: 'VIP' } })
    ])
  }

  // 搜索用户(手机号/邀请码)
  async searchUser(searchVal: string, pageNum: number, pageSize: number, role?: userRole) {
    let where: any = {
      OR: [
        { mobile: { contains: searchVal } },
        { referralCode: { contains: searchVal } }
      ]
    }
    if (role) where.role = role
    return await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where })
    ])
  }

  // 根据手机号查询用户是否注册
  userFindByPhone(mobile: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.findUnique({
      where: { mobile }
    })
  }

  // 更新用户头像
  async changeUserAvatar(id: string, data: UpdateUserAvatarDto) {
    return await this.prisma.user.update({
      where: { id },
      data: { avatarUrl: data.url },
    })
  }

  // 更新用户信息
  async updateUserInfo(userId: string, dto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    })
  }

  // 根据邀请码更新用户
  async updateUserInfoByReferralCode(
    referralCode: string,
    myCodeUrl: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? this.prisma
    return db.user.update({
      where: { referralCode },
      data: { myCodeUrl },
    })
  }

  // 将用户更新为会员
  updateUserByVip(
    userId,
    vipMaxUsers,
    vipLevel,
    vipGift,
    vipDiscount,
    vipStartTime,
    vipEndTime,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'VIP',
        vipMaxUsers,
        vipLevel,
        vipGift,
        vipDiscount,
        vipStartTime,
        vipEndTime,
      },
    })
  }

  // 将用户更新为店长/普通用户 （门店店长变更时操作）
  updateUserByManager(userId: string, storeId: string | null, role: userRole, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.update({
      where: { id: userId },
      data: { role, storeId }
    })
  }

  // 删除当前用户
  deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } })
  }

  // 扣除会员免费次数
  decVipGift(userId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.update({
      where: { id: userId, vipGift: { gte: 1 } },
      data: { vipGift: { decrement: 1 }, lastGiftTime: new Date() }
    })
  }

  // =================== 积分操作 ===================

  // 查询用户积分
  findUserScore(openid: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.findUnique({ where: { openid } })
  }

  // 增加用户积分
  updateUserIncScore(userId: string, score: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.update({
      where: { id: userId },
      data: { score: { increment: score } },
    })
  }

  // 根据openid扣除用户积分
  updateUserDecScore(openid: string, score: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.update({
      where: { openid },
      data: { score: { decrement: score } },
    })
  }

  // =================== 佣金 ===================

  // 新增佣金
  // updateUserIncBalance(userId: string, amount: string, tx?: Prisma.TransactionClient) {
  //   const db = tx ?? this.prisma
  //   return this.prisma.user.update({
  //     where: { id: userId },
  //     data: { settle_balance: { increment: new Prisma.Decimal(amount) } }
  //   })
  // }

  // =================== 查询上下级 ===================

  // 根据邀请码找到用户
  findByReferralCode(code: string) {
    return this.prisma.user.findUnique({
      where: { referralCode: code }
    })
  }

  // 查询当前用户下级--2级
  async findChildUser(userId: string, pageNum: number, pageSize: number) {
    // 一级
    const level1 = await this.prisma.user.findMany({
      where: { inviterId: userId },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        mobile: true,
        createdAt: true
      }
    })

    // 二级
    const level2 = await this.prisma.user.findMany({
      where: {
        inviterId: {
          in: level1.map(u => u.id)
        }
      },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        mobile: true,
        createdAt: true
      }
    })

    const list = [
      ...level1.map(u => ({ ...u, level: 1 })),
      ...level2.map(u => ({ ...u, level: 2 }))
    ]
    return list
  }

  // 查询用户的上级--2级
  findParentUser(userId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.user.findUnique({
      where: { id: userId },
      include: { inviter: { include: { inviter: true } } }
    })
  }
}
