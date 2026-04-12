import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePointsFlowDto } from './dto/create-points-flow.dto'
import { PointsFlowTypeQuery } from './dto/query-points-flow.dto'

@Injectable()
export class PointsFlowRepository {
  constructor(private prisma: PrismaService) {}

  // 插入积分明细
  create(pointsFlowDto: CreatePointsFlowDto) {
    return this.prisma.pointsFlow.create({
      data: pointsFlowDto,
    })
  }

  // 根据用户获取积分明细
  async findAll(userId: string, tab: PointsFlowTypeQuery, pageNum: number, pageSize: number) {
    let where: any = {
      userId,
    }
    if (tab !== 'ALL') {
      where.type = tab
    }
    return await Promise.all([
      this.prisma.pointsFlow.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pointsFlow.count({ where }),
    ])
  }
}
