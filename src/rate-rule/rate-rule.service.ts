import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateRateRuleDto } from './dto/create-rate-rule.dto'
import { UpdateRateRuleDto } from './dto/update-rate-rule.dto'
import { RateRuleRepository } from './rate-rule.repository'

@Injectable()
export class RateRuleService {
  constructor(private repo: RateRuleRepository) { }

  // 创建积分规则
  async create(createRateRuleDto: CreateRateRuleDto) {
    //1.查询当前是否有规则
    const rate = await this.repo.findAll()
    if (rate.length > 0) throw new BadRequestException('已有规则无须添加')
    //2.如果没有就添加
    const result = await this.repo.create(createRateRuleDto)
    return {
      id: result.id,
    }
  }

  // 查询积分规则
  async findAll() {
    return await this.repo.findAll()
  }

  // 更新当前积分规则
  async update(id: string, updateRateRuleDto: UpdateRateRuleDto) {
    if (!id) throw new BadRequestException('参数错误')
    await this.repo.update(id, updateRateRuleDto)
    return {
      acknowledged: true,
    }
  }

  // 移除当前积分规则
  async remove(id: string) {
    return await this.repo.remove(id)
  }
}
