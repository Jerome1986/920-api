import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AgentInviteService } from './agent-invite.service'
import { ClaimAgentInviteDto } from './dto/claim-agent-invite.dto'
import { QueryAgentInviteLandingDto } from './dto/query-agent-invite-landing.dto'
import { QueryMyAgentInviteBenefitDto } from './dto/query-my-agent-invite-benefit.dto'

@Controller('agent-invites')
export class AgentInviteController {
  constructor(private readonly agentInviteService: AgentInviteService) {}

  // 查询当前用户通过代理邀请获得的免费贴膜权益
  @Get('claims/me')
  findMyBenefit(@Query() query: QueryMyAgentInviteBenefitDto) {
    // 用户 ID 暂由查询参数传入，后续接入鉴权后改为从 Token 获取
    return this.agentInviteService.findMyBenefit(query.userId)
  }

  // 查询当前用户在指定代理邀请下的领取页状态
  @Get(':agentCode/landing')
  landing(
    @Param('agentCode') agentCode: string,
    @Query() query: QueryAgentInviteLandingDto,
  ) {
    // 将邀请码和临时用户 ID 交给业务层计算页面状态
    return this.agentInviteService.landing(agentCode, query.userId)
  }

  // 当前用户确认领取代理邀请赠送的免费贴膜权益
  @Post('claims')
  claim(@Body() claimAgentInviteDto: ClaimAgentInviteDto) {
    // 用户 ID 暂由请求体传入，后续接入鉴权后改为从 Token 获取
    return this.agentInviteService.claim(claimAgentInviteDto)
  }
}
