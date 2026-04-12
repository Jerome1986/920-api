import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateJobApplyDto } from './dto/create-job-apply.dto'
import { ApplyType } from '@prisma/client'

@Injectable()
export class JobApplyRepository {
  constructor(private prisma: PrismaService) {}

  // 提交员工招聘申请
  create(createJobApplyDto: CreateJobApplyDto) {
    return this.prisma.jobApply.create({
      data: {
        ...createJobApplyDto,
        status: 'PENDING',
      },
    })
  }

  findOne(userId: string, type: ApplyType) {
    return this.prisma.jobApply.findFirst({ where: { userId, type } })
  }
}
