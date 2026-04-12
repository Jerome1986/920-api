import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CommissionRuleRepository } from './commission-rule.repository';

@Injectable()
export class CommissionRuleService {
  constructor(private commissionRuleRepo: CommissionRuleRepository) { }

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
}
