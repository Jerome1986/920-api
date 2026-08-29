import { Module } from '@nestjs/common';
import { AgentInviteService } from './agent-invite.service';
import { AgentInviteController } from './agent-invite.controller';
import { AgentInviteRepository } from './agent-invite.repository';

@Module({
  controllers: [AgentInviteController],
  providers: [AgentInviteService, AgentInviteRepository],
  exports: [AgentInviteRepository],
})
export class AgentInviteModule {}
