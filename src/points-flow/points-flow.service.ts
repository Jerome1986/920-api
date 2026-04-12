import { Injectable } from '@nestjs/common'
import { CreatePointsFlowDto } from './dto/create-points-flow.dto'
import { PointsFlowRepository } from './points-flow.repository'
import { PointsFlowTypeQuery } from './dto/query-points-flow.dto'

@Injectable()
export class PointsFlowService {
  constructor(private pointsFlowRepo: PointsFlowRepository) {}

  // 插入积分明细
  async create(pointsFlowDto: CreatePointsFlowDto) {
    return this.pointsFlowRepo.create(pointsFlowDto)
  }

  // 根据用户获取积分明细
  async findAll(userId: string, tab: PointsFlowTypeQuery, pageNum: number, pageSize: number) {
    const [list, total] = await this.pointsFlowRepo.findAll(userId, tab, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }
}
