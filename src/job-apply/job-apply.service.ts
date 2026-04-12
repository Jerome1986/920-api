import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateJobApplyDto } from './dto/create-job-apply.dto'
import { JobApplyRepository } from './job-apply.repository'
import { ApplyType } from '@prisma/client'

@Injectable()
export class JobApplyService {
  constructor(private jobApplyRepo: JobApplyRepository) {}

  // 提交申请
  async create(createJobApplyDto: CreateJobApplyDto) {
    // 检查当前用户是否提交过
    const userApply = await this.jobApplyRepo.findOne(
      createJobApplyDto.userId,
      createJobApplyDto.type,
    )
    if (userApply) {
      throw new BadRequestException('不可重复申请')
    }
    const jobApply = await this.jobApplyRepo.create(createJobApplyDto)
    return {
      insertedId: jobApply.id,
    }
  }

  findOne(userId: string, type: ApplyType) {
    return this.jobApplyRepo.findOne(userId, type)
  }
}
