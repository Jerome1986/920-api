import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateCommissionRuleDto } from "./dto/update-commission-rule.dto";

@Injectable()
export class CommissionRuleRepository {
  constructor(private prisma: PrismaService) { }

  // 获取佣金规则
  findAll() {
    return this.prisma.commissionRule.findMany()
  }

  // 更新佣金规则
  update(id: number, updateCommissionRuleDto: UpdateCommissionRuleDto) {
    return this.prisma.commissionRule.update({
      where: { id },
      data: updateCommissionRuleDto
    })
  }

  // 设置总佣金
  setTotalRate(id: number, totalRate: string) {
    return this.prisma.commissionRule.update({
      where: { id },
      data: { totalRate }
    })
  }
}