import { Module } from '@nestjs/common';
import { AgentProfileService } from './agent-profile.service';
import { AgentProfileController } from './agent-profile.controller';
import { AgentProfileRepository } from './agent-profile.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [AgentProfileController],
  providers: [AgentProfileService,AgentProfileRepository,UserRepository],
})
export class AgentProfileModule {}
