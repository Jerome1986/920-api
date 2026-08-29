import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgentInviteService } from './agent-invite.service';
import { CreateAgentInviteDto } from './dto/create-agent-invite.dto';
import { UpdateAgentInviteDto } from './dto/update-agent-invite.dto';

@Controller('agent-invite')
export class AgentInviteController {
  constructor(private readonly agentInviteService: AgentInviteService) {}

  @Post()
  create(@Body() createAgentInviteDto: CreateAgentInviteDto) {
    return this.agentInviteService.create(createAgentInviteDto);
  }

  @Get()
  findAll() {
    return this.agentInviteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentInviteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentInviteDto: UpdateAgentInviteDto) {
    return this.agentInviteService.update(+id, updateAgentInviteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentInviteService.remove(+id);
  }
}
