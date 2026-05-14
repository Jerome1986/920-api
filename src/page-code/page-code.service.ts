import { BadRequestException, Injectable } from '@nestjs/common'
import { promises as fs } from 'fs'
import { join } from 'path'
import { PrismaService } from 'src/prisma/prisma.service'
import { pageCodeGet } from 'src/utils/pageCode'

const USER_FIND_MO_CONFIG_KEY = 'userFindMoQrCodeUrl'
const USER_FIND_MO_FILE_NAME = 'user-find-mo.png'
const USER_FIND_MO_DIR = 'page-codes'

@Injectable()
export class PageCodeService {
  constructor(private prisma: PrismaService) { }

  // 生成或复用扫码找膜小程序码
  async createUserFindMoCode() {
    const filePath = this.getUserFindMoFilePath()
    const [config] = await this.prisma.$queryRaw<{ value: string }[]>`
      SELECT value FROM app_config WHERE \`key\` = ${USER_FIND_MO_CONFIG_KEY} LIMIT 1
    `

    if (config?.value && await this.fileExists(filePath)) {
      return { qrCodeUrl: config.value }
    }

    try {
      const buffer = await pageCodeGet()
      await fs.mkdir(join(process.cwd(), 'upload', USER_FIND_MO_DIR), { recursive: true })
      await fs.writeFile(filePath, buffer)

      const qrCodeUrl = this.getUserFindMoPublicUrl()
      await this.prisma.$executeRaw`
        INSERT INTO app_config (\`key\`, value)
        VALUES (${USER_FIND_MO_CONFIG_KEY}, ${qrCodeUrl})
        ON DUPLICATE KEY UPDATE value = ${qrCodeUrl}, updated_at = CURRENT_TIMESTAMP
      `

      return { qrCodeUrl }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BadRequestException(`生成扫码找膜二维码失败：${message}`)
    }
  }

  private getUserFindMoFilePath() {
    return join(process.cwd(), 'upload', USER_FIND_MO_DIR, USER_FIND_MO_FILE_NAME)
  }

  private getUserFindMoPublicUrl() {
    const baseUrl = process.env.UPLOAD_PUBLIC_BASE_URL ?? 'https://api.920keji.com/upload'
    return `${baseUrl.replace(/\/$/, '')}/${USER_FIND_MO_DIR}/${USER_FIND_MO_FILE_NAME}`
  }

  private async fileExists(filePath: string) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}
