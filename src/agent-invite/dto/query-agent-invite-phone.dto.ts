import { IsString } from "class-validator"

export class QueryAgentInvitePhoneDto {
  @IsString()
  agentId: string = ''

  @IsString()
  mobile: string = ''
}
