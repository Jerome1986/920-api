import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAgentProfileDto } from './dto/create-agent-profile.dto';
import { AgentProfileRepository } from './agent-profile.repository';
import { generateAgentCode } from 'src/utils/generateAgentCode';
import { UserRepository } from 'src/user/user.repository';
import { QueryAgentProfileDto, QueryAgentStatus } from './dto/query-agent-profile.dto';
import { pageCodeGet } from 'src/utils/pageCode';
import { AgentStatus } from '@prisma/client';
import { UpdateAgentStatusDto } from './dto/update-agent-status.dto';
import * as Minio from 'minio';

const AGENT_CODE_BUCKET = 'erq1dfin-920'
const AGENT_CODE_STORAGE_ENDPOINT = 'objectstorageapi.gzg.sealos.run'

@Injectable()
export class AgentProfileService {
  constructor(
    private agentProfileRepo:AgentProfileRepository,
    private userRepo:UserRepository
  ) {}

  // 设定某个用户为代理人
 async setAgent(createAgentProfileDto: CreateAgentProfileDto) {
    // 1.查询用户是否为注册用户
    const userId = createAgentProfileDto.userId
    const user = await this.userRepo.findOne(userId)
    if(!user) {
      throw new BadRequestException('当前用户未注册')
    }

    // 2. 避免对已是代理的用户重复生成邀请码和二维码
    const existingAgent = await this.agentProfileRepo.findByUserId(userId)
    if (existingAgent) {
      throw new BadRequestException('当前用户已是代理人')
    }

    // 3. 生成代理邀请码
    const agentCode = generateAgentCode()

    // 4. 调用微信接口生成携带代理邀请码的小程序码
    let agentCodeUrl = ''
    try {
      agentCodeUrl = await this.generateAgentCodeUrl(agentCode)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BadRequestException(`生成代理邀请码二维码失败：${message}`)
    }

    // 5. 将代理邀请码和二维码链接一并写入代理资料
    try {
      return await this.agentProfileRepo.setAgent(createAgentProfileDto, agentCode, agentCodeUrl)
    } catch (error) {
      // 数据库写入失败时删除已生成的孤立图片
      await this.deleteAgentCodeImage(agentCode)
      throw error
    }
  }

  // 后台获取所有代理信息
  async findAll(queryAgentProfileDto: QueryAgentProfileDto) {
    // 1. 处理分页默认值，未传时默认查询第 1 页、每页 10 条
    const pageNum = queryAgentProfileDto.pageNum ?? 1
    const pageSize = queryAgentProfileDto.pageSize ?? 10

    // 2. 处理筛选条件，默认查询全部状态，并去除关键词首尾空格
    const status = queryAgentProfileDto.status ?? QueryAgentStatus.ALL
    const keyword = queryAgentProfileDto.keyword?.trim() ?? ''

    // 3. 调用数据层，同时获取当前页数据和符合条件的总数
    const [list, total] = await this.agentProfileRepo.findAll(
      pageNum,
      pageSize,
      status,
      keyword,
      queryAgentProfileDto.openedStartAt,
      queryAgentProfileDto.openedEndAt,
    )

    // 4. 组装统一的分页返回结果
    return { list, total, pageNum, pageSize, totalPage: Math.ceil(total / pageSize) }
  }

  // 后台启用或停用代理资格
  async updateStatus(id: string, updateAgentStatusDto: UpdateAgentStatusDto) {
    // 1. 查询代理资料，确保操作对象存在
    const agentProfile = await this.agentProfileRepo.findOne(id)
    if (!agentProfile) throw new BadRequestException('代理人不存在')

    // 2. 停用时仅更新状态和停用信息，保留原邀请码及二维码
    if (updateAgentStatusDto.status === AgentStatus.DISABLED) {
      if (agentProfile.status === AgentStatus.DISABLED) return agentProfile

      return this.agentProfileRepo.disable(
        id,
        updateAgentStatusDto.operatorId,
        updateAgentStatusDto.disabledReason,
      )
    }

    // 3. 启用时优先沿用已存储在 MinIO 中的邀请码二维码
    if (this.isAgentCodeStoredInMinio(agentProfile.agentCodeUrl)) {
      if (agentProfile.status === AgentStatus.ACTIVE) return agentProfile
      return this.agentProfileRepo.enable(id)
    }

    // 4. 历史代理没有二维码或仍是旧本地链接时，使用原 agentCode 补生成
    let agentCodeUrl = ''
    try {
      agentCodeUrl = await this.generateAgentCodeUrl(agentProfile.agentCode)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new BadRequestException(`生成代理邀请码二维码失败：${message}`)
    }

    // 5. 保存二维码链接并启用代理，入库失败时清理孤立图片
    try {
      return await this.agentProfileRepo.enable(id, agentCodeUrl)
    } catch (error) {
      await this.deleteAgentCodeImage(agentProfile.agentCode)
      throw error
    }
  }

  // 生成代理邀请小程序码，上传到 MinIO 存储桶并返回公开访问链接
  private async generateAgentCodeUrl(agentCode: string) {
    const buffer = await pageCodeGet({
      scene: `agentCode=${agentCode}`,
      page: 'pages/login/login',
      width: 430,
      checkPath: false,
    })

    const minioClient = this.getMinioClient()
    const objectName = this.getAgentCodeObjectName(agentCode)
    await minioClient.putObject(AGENT_CODE_BUCKET, objectName, buffer, buffer.length, {
      'Content-Type': 'image/png',
    })

    return `https://${AGENT_CODE_STORAGE_ENDPOINT}/${AGENT_CODE_BUCKET}/${objectName}`
  }

  // 代理资料入库失败时清理 MinIO 中已上传的孤立二维码
  private async deleteAgentCodeImage(agentCode: string) {
    try {
      await this.getMinioClient().removeObject(
        AGENT_CODE_BUCKET,
        this.getAgentCodeObjectName(agentCode),
      )
    } catch {
      // 图片不存在或清理失败不覆盖原始数据库异常
    }
  }

  // 复用项目现有的 MinIO 存储配置
  private getMinioClient() {
    return new Minio.Client({
      endPoint: AGENT_CODE_STORAGE_ENDPOINT,
      accessKey: 'erq1dfin',
      secretKey: 'zqcktn64pd28pfvr',
    })
  }

  // 代理邀请码二维码在存储桶中的唯一对象路径
  private getAgentCodeObjectName(agentCode: string) {
    return `qrcodes/agentCode_${agentCode}.png`
  }

  // 只有当前 MinIO 存储桶链接才视为有效，旧本地 upload 链接需重新生成
  private isAgentCodeStoredInMinio(agentCodeUrl: string | null) {
    const prefix = `https://${AGENT_CODE_STORAGE_ENDPOINT}/${AGENT_CODE_BUCKET}/qrcodes/`
    return Boolean(agentCodeUrl?.startsWith(prefix))
  }
}
