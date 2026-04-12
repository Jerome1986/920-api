import { Injectable } from '@nestjs/common'
import { CreateRateRuleDto } from './dto/create-rate-rule.dto'
import { UpdateRateRuleDto } from './dto/update-rate-rule.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class RateRuleRepository {
  constructor(private prisma: PrismaService) {}

  // 创建积分规则
  async create(createRateRuleDto: CreateRateRuleDto) {
    return await this.prisma.rateRule.create({ data: createRateRuleDto })
  }

  // 获取积分规则
  async findAll() {
    return await this.prisma.rateRule.findMany()
  }

  // 更新当前积分规则
  async update(id: string, updateRateRuleDto: UpdateRateRuleDto) {
    return await this.prisma.rateRule.update({
      where: { id },
      data: updateRateRuleDto,
    })
  }

  // 删除当前积分规则
  async remove(id: string) {
    return await this.prisma.rateRule.delete({ where: { id } })
  }
}
