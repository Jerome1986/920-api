import { Module } from '@nestjs/common'
import { TeamShowService } from './team-show.service'
import { TeamShowController } from './team-show.controller'
import { TeamShowRepository } from './team-show.repository'

@Module({
  controllers: [TeamShowController],
  providers: [TeamShowService, TeamShowRepository],
})
export class TeamShowModule {}
