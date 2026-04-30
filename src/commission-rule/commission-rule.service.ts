import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CommissionRuleRepository } from './commission-rule.repository';
import { UserRepository } from 'src/user/user.repository';
import { CommissionStatus, Prisma } from '@prisma/client';
import { CommissionSourceParams, StoreBizTypeParams } from './dto/create-commission-rule.dto';

@Injectable()
export class CommissionRuleService {
  constructor(
    private commissionRuleRepo: CommissionRuleRepository,
    private userRepo: UserRepository
  ) { }

  // 获取佣金规则
  async findAll() {
    const list = await this.commissionRuleRepo.findAll()
    return list[0]
  }

  // 获取用户佣金明细
  async findOneByUser(userId: string, pageNum: number, pageSize: number) {
    if (!userId) throw new BadRequestException('用户ID不存在')
    // 1.查询当前用户佣金记录
    const [commissionRecord, total] = await this.commissionRuleRepo.findOneByUser(userId, pageNum, pageSize)

    // 2.批量获取佣金贡献人信息
    const userIds = commissionRecord.map(c => c.fromUserId)
    const users = await this.userRepo.findByIds(userIds)

    // 3.存入MAP，用于映射
    const userMap = new Map(users.map(u => [u.id, u]))

    // 4.组装数据
    const list = commissionRecord.map(record => {
      const user = userMap.get(record.fromUserId)
      return {
        id: record.id,
        subordinateAvatar: user?.avatarUrl,
        subordinateMobile: user?.mobile,
        subordinateRole: user?.role,
        bizLabel: record.type,
        amount: record.amount,
        createdAt: record.createdAt
      }
    })

    // 5.返回数据
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 更新佣金规则
  async update(id: number, updateCommissionRuleDto: UpdateCommissionRuleDto) {
    // 1.获取当前总比例
    const rate = await this.commissionRuleRepo.findAll()
    const totalRate = Number(rate[0].totalRate)
    // 2.校验当前所有比例总和不可超过总比例
    const level1Rate = Number(updateCommissionRuleDto.level1Rate)
    const level2Rate = Number(updateCommissionRuleDto.level2Rate)
    const platformRate = Number(updateCommissionRuleDto.platformRate)
    if (level1Rate + level2Rate + platformRate > totalRate) {
      throw new BadRequestException('不可超过总比例')
    }

    return this.commissionRuleRepo.update(id, updateCommissionRuleDto)
  }

  // 设置总佣金
  async setTotalRate(id: number, totalRate: string) {
    // 1.获取当前规则
    const rate = await this.commissionRuleRepo.findAll()
    const rateRule = rate[0]
    // 2.总佣金比例不可以小于其他比例之和
    const level1Rate = Number(rateRule.level1Rate)
    const level2Rate = Number(rateRule.level2Rate)
    const platformRate = Number(rateRule.platformRate)
    if (level1Rate + level2Rate + platformRate > Number(totalRate)) {
      throw new BadRequestException('必须大于其他佣金之和')
    }

    return this.commissionRuleRepo.setTotalRate(id, totalRate)
  }

  // 计算佣金
  async calculateCommission(
    userId: string,
    actualPayment: number,
    tx: Prisma.TransactionClient
  ) {
    const commission = await this.commissionRuleRepo.findAll()
    const level1Rate = commission[0].level1Rate || 0
    const level2Rate = commission[0].level2Rate || 0

    const res = await this.userRepo.findParentUser(userId, tx)
    const level1User = res?.inviter
    const level2User = level1User?.inviter

    const list: any[] = []

    if (level1User?.role === 'MANAGER') {
      const amount = Number((actualPayment * Number(level1Rate)).toFixed(2))
      list.push({
        userId: level1User.id,
        level: 1,
        amount,
        rate: level1Rate
      })
    }

    if (level2User?.role === 'MANAGER') {
      const amount = Number((actualPayment * Number(level2Rate)).toFixed(2))
      list.push({
        userId: level2User.id,
        level: 2,
        amount,
        rate: level2Rate
      })
    }

    return list
  }

  // 写入佣金流水
  async createCommissionRecords(list, orderId: string, userId: string, type: StoreBizTypeParams, source: CommissionSourceParams, tx: Prisma.TransactionClient) {
    for (const item of list) {
      await this.commissionRuleRepo.createCommissionRecord({
        userId: item.userId,
        fromUserId: userId,
        type,
        relatedId: orderId,
        amount: item.amount.toString(),
        rate: item.rate.toString(),
        commissionSource: source
      }, tx)
    }
  }
}
