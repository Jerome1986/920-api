import { BadRequestException, Injectable } from '@nestjs/common'
import { UserRepository } from './user.repository'
import { UpdateUserAvatarDto } from './dto/update-avatar.dto'
import { Prisma, userRole } from '@prisma/client'
import { UpdateUserDto } from './dto/update-user.dto'
import { AuthRepository } from 'src/auth/auth.repository'
import axios from 'axios'
import * as Minio from 'minio'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(
    private repo: UserRepository,
    private authRepo: AuthRepository,
    private prisma: PrismaService,
  ) { }

  // 获取所有用户信息
  async findAll(pageNum: number, pageSize: number, role?: userRole) {
    const [list, total] = await this.repo.findAll(pageNum, pageSize, role)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 查询指定用户信息
  async findOne(id: string) {
    return await this.repo.findOne(id)
  }

  // 搜索用户信息
  async searchUser(searchVal: string, pageNum: number, pageSize: number, role?: userRole) {
    const [list, total] = await this.repo.searchUser(searchVal, pageNum, pageSize, role)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 更新用户头像
  async updateAvatar(id: string, dto: UpdateUserAvatarDto) {
    const res = await this.repo.changeUserAvatar(id, dto)
    return {
      userId: res.id,
      avatarUrl: res.avatarUrl,
    }
  }

  // 更新用户信息
  async updateUserInfo(userId: string, dto: UpdateUserDto) {
    return await this.repo.updateUserInfo(userId, dto)
  }

  // 删除指定用户
  async deleteUser(id: string) {
    return this.repo.deleteUser(id)
  }

  // 查询用户下级
  async findChildUser(userId: string, pageNum: number, pageSize: number) {
    return this.repo.findChildUser(userId, pageNum, pageSize)
  }

  // 查询用户上级
  async findParentUser(referralCode: string) {
    return this.repo.findParentUser(referralCode)
  }

  // 生成自己的好友邀请码
  async friendCode(referralCode: string) {
    try {
      const qrCodeUrl = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 获取 access_token（带缓存）
        const accessToken = await this.authRepo.getAccessToken()

        // 2. 请求微信生成二维码
        const qrRes = await axios.post(
          `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
          {
            scene: `inviterCode=${referralCode}`,
            page: 'pages/login/login',
            width: 430,
            check_path: false,
          },
          { responseType: 'arraybuffer' },
        )

        // 微信返回的图片BUFFER
        let buffer = Buffer.from(qrRes.data, 'binary')

        // console.log('微信返回 headers:', qrRes.headers['content-type'], 'size:', buffer.length)

        const minioClient = new Minio.Client({
          endPoint: 'objectstorageapi.gzg.sealos.run',
          accessKey: 'erq1dfin',
          secretKey: 'zqcktn64pd28pfvr',
        })

        // 文件路径
        const fileName = `qrcodes/inviterCode_${referralCode}.png`
        const bucket = 'erq1dfin-920'
        const exists = await minioClient.bucketExists(bucket)
        console.log('存储桶', exists)

        await minioClient.putObject(bucket, fileName, buffer, buffer.length, {
          'Content-Type': 'image/png',
        })
        const url = `https://objectstorageapi.gzg.sealos.run/${bucket}/${fileName}`

        // 3.将返回的URL更新到用户信息
        const user = await this.repo.updateUserInfoByReferralCode(referralCode, url, tx)
        return user.myCodeUrl
      })

      // 4.返回更新后的二维码链接
      return {
        qrCodeUrl,
      }
    } catch (error) {
      throw new BadRequestException('服务错误')
    }
  }
}
