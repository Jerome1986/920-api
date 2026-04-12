import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { PointsFlowService } from './points-flow.service'
import { CreatePointsFlowDto } from './dto/create-points-flow.dto'
import { QueryPointsDto } from './dto/query-points-flow.dto'

@Controller('points-flow')
export class PointsFlowController {
  constructor(private readonly pointsFlowService: PointsFlowService) {}

  // 插入积分明细
  @Post()
  create(@Body() createPointsFlowDto: CreatePointsFlowDto) {
    return this.pointsFlowService.create(createPointsFlowDto)
  }

  // 获取当前用户的积分流水
  @Get(':userId')
  findAll(@Param('userId') userId: string, @Query() query: QueryPointsDto) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.pointsFlowService.findAll(userId, query.tab, pageNum, pageSize)
  }
}
