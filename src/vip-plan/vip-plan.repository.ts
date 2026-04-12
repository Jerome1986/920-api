import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateVipPlanDto } from './dto/create-vip-plan.dto'
import { UpdateVipPlanDto } from './dto/update-vip-plan.dto'

@Injectable()
export class VipPlanRepository {
  constructor(private prisma: PrismaService) { }

  // 添加会员产品
  create(createVipPlanDto: CreateVipPlanDto) {
    return this.prisma.vipPlan.create({ data: createVipPlanDto })
  }

  // 获取所有会员产品
  findAll() {
    return this.prisma.vipPlan.findMany()
  }

  findOne(planId: number) {
    return this.prisma.vipPlan.findUnique({ where: { id: planId } })
  }

  // 更新指定会员产品
  update(id: number, updateVipPlanDto: UpdateVipPlanDto) {
    return this.prisma.vipPlan.update({
      where: { id },
      data: updateVipPlanDto,
    })
  }

  // 删除指定会员产品
  delete(id: number) {
    return this.prisma.vipPlan.delete({ where: { id } })
  }
}
