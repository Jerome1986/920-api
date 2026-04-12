import { Module } from '@nestjs/common'
import { JobApplyService } from './job-apply.service'
import { JobApplyController } from './job-apply.controller'
import { JobApplyRepository } from './job-apply.repository'

@Module({
  controllers: [JobApplyController],
  providers: [JobApplyService, JobApplyRepository],
})
export class JobApplyModule {}
