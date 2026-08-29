import { Module } from '@nestjs/common';
import { AgentInviteService } from './agent-invite.service';
import { AgentInviteController } from './agent-invite.controller';

@Module({
  controllers: [AgentInviteController],
  providers: [AgentInviteService],
})
export class AgentInviteModule {}
