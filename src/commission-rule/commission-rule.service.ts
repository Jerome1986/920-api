import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CommissionRuleRepository } from './commission-rule.repository';
import { UserRepository } from 'src/user/user.repository';
import { Prisma } from '@prisma/client';
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

  // 记录佣金流水
  async settleOrderCommission(userId: string, orderId: string, actualPayment: number, tx: Prisma.TransactionClient) {
    // 1 获取佣金比例
    const commission = await this.commissionRuleRepo.findAll()
    const level1Rate = commission[0].level1Rate || 0
    const level2Rate = commission[0].level2Rate || 0
    // 2 查询当前用户是否有上级，且为manager
    const res = await this.userRepo.findParentUser(userId, tx)
    const level1User = res?.inviter
    const level2User = level1User?.inviter
    // 3 一级佣金
    if (level1User?.role === 'MANAGER') {
      const amount = (actualPayment * Number(level1Rate)).toFixed(2)
      // 记录流水佣金
      const commissionRecordData = {
        userId: level1User.id,
        fromUserId: userId,
        type: StoreBizTypeParams.PRODUCT,
        relatedId: orderId,
        amount,
        rate: level1Rate.toString(),
        commissionSource: CommissionSourceParams.PLATFORM
      }
      await this.commissionRuleRepo.createCommissionRecord(commissionRecordData, tx)
    }
    // 4 二级佣金
    if (level2User?.role === 'MANAGER') {
      const amount = (actualPayment * Number(level2Rate)).toFixed(2)
      // 记录流水佣金
      const commissionRecordData = {
        userId: level2User.id,
        fromUserId: userId,
        type: StoreBizTypeParams.PRODUCT,
        relatedId: orderId,
        amount,
        rate: level2Rate.toString(),
        commissionSource: CommissionSourceParams.PLATFORM
      }
      await this.commissionRuleRepo.createCommissionRecord(commissionRecordData, tx)
    }
  }
}
