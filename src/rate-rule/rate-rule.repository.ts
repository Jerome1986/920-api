import { Injectable } from '@nestjs/common'
import { CreateRateRuleDto } from './dto/create-rate-rule.dto'
import { UpdateRateRuleDto } from './dto/update-rate-rule.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class RateRuleRepository {
  constructor(private prisma: PrismaService) { }

  // 创建积分规则
  create(createRateRuleDto: CreateRateRuleDto) {
    return this.prisma.rateRule.create({ data: createRateRuleDto })
  }

  // 获取积分规则
  findAll(tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.rateRule.findMany()
  }

  // 更新当前积分规则
  update(id: string, updateRateRuleDto: UpdateRateRuleDto) {
    return this.prisma.rateRule.update({
      where: { id },
      data: updateRateRuleDto,
    })
  }

  // 删除当前积分规则
  remove(id: string) {
    return this.prisma.rateRule.delete({ where: { id } })
  }
}
