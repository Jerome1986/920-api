import { Injectable } from '@nestjs/common';
import { CreateAgentInviteDto } from './dto/create-agent-invite.dto';
import { UpdateAgentInviteDto } from './dto/update-agent-invite.dto';

@Injectable()
export class AgentInviteService {
  create(createAgentInviteDto: CreateAgentInviteDto) {
    return 'This action adds a new agentInvite';
  }

  findAll() {
    return `This action returns all agentInvite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agentInvite`;
  }

  update(id: number, updateAgentInviteDto: UpdateAgentInviteDto) {
    return `This action updates a #${id} agentInvite`;
  }

  remove(id: number) {
    return `This action removes a #${id} agentInvite`;
  }
}
