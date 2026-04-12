import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { JobApplyService } from './job-apply.service'
import { CreateJobApplyDto } from './dto/create-job-apply.dto'
import { ApplyType } from '@prisma/client'

@Controller('job-apply')
export class JobApplyController {
  constructor(private readonly jobApplyService: JobApplyService) {}

  // 提交员工招聘申请
  @Post('add')
  create(@Body() createJobApplyDto: CreateJobApplyDto) {
    return this.jobApplyService.create(createJobApplyDto)
  }

  // 查询当前用户是否申请
  @Get(':userId')
  findOne(@Param('userId') userId: string, @Query('type') type: ApplyType) {
    console.log('type', type)

    return this.jobApplyService.findOne(userId, type)
  }
}
