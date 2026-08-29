import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentInviteDto } from './create-agent-invite.dto';

export class UpdateAgentInviteDto extends PartialType(CreateAgentInviteDto) {}
