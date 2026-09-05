import { Controller, Get, Post, Body, Query, Patch, Param } from '@nestjs/common';
import { AgentProfileService } from './agent-profile.service';
import { CreateAgentProfileDto } from './dto/create-agent-profile.dto';
import { QueryAgentProfileDto } from './dto/query-agent-profile.dto';
import { UpdateAgentStatusDto } from './dto/update-agent-status.dto';

@Controller('agent-profile')
export class AgentProfileController {
  constructor(private readonly agentProfileService: AgentProfileService) { }

  // 设定某个用户为代理人
  @Post('setAgent')
  setAgent(@Body() createAgentProfileDto: CreateAgentProfileDto) {
    return this.agentProfileService.setAgent(createAgentProfileDto)
  }

  // 后台获取所有代理信息
  // 接收分页、状态、关键词和开通时间筛选条件
  @Get()
  findAll(@Query() queryAgentProfileDto: QueryAgentProfileDto) {
    // 将已通过 ValidationPipe 校验的查询参数交给业务层处理
    return this.agentProfileService.findAll(queryAgentProfileDto)
  }

  // 前端查询当前用户是否为代理人
  @Get('me/:userId')
  findMyAgentProfile(@Param('userId') userId: string) {
    return this.agentProfileService.findMyAgentProfile(userId)
  }

  // 后台启用或停用代理资格
  @Patch('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateAgentStatusDto: UpdateAgentStatusDto,
  ) {
    return this.agentProfileService.updateStatus(id, updateAgentStatusDto)
  }
}
