import { Injectable } from '@nestjs/common'
import { CreateVipPlanDto } from './dto/create-vip-plan.dto'
import { UpdateVipPlanDto } from './dto/update-vip-plan.dto'
import { VipPlanRepository } from './vip-plan.repository'

@Injectable()
export class VipPlanService {
  constructor(private vipPlanRepo: VipPlanRepository) { }

  // 添加会员产品
  async create(createVipPlanDto: CreateVipPlanDto) {
    const vipPlan = await this.vipPlanRepo.create(createVipPlanDto)
    return {
      id: vipPlan.id
    }
  }

  // 获取所有会员产品
  async findAll() {
    const list = await this.vipPlanRepo.findAll()
    return list
  }

  // 获取会员产品详情
  async findOne(planId: number) {
    return this.vipPlanRepo.findOne(planId)
  }

  // 更新指定会员产品
  async update(id: number, UpdateVipPlanDto: UpdateVipPlanDto) {
    return this.vipPlanRepo.update(id, UpdateVipPlanDto)
  }

  // 删除指定会员产品
  async delete(id: number) {
    return this.vipPlanRepo.delete(id)
  }
}
