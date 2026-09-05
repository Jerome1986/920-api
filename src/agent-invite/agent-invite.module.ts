import { Module } from '@nestjs/common';
import { AgentInviteService } from './agent-invite.service';
import { AgentInviteController } from './agent-invite.controller';
import { AgentInviteRepository } from './agent-invite.repository';
import { AgentInviteRecordsExceptionFilter } from './filters/agent-invite-records-exception.filter';

@Module({
  controllers: [AgentInviteController],
  providers: [AgentInviteService, AgentInviteRepository, AgentInviteRecordsExceptionFilter],
  exports: [AgentInviteRepository],
})
export class AgentInviteModule {}
