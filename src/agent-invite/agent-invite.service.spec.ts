import { Test, TestingModule } from '@nestjs/testing';
import { AgentInviteService } from './agent-invite.service';

describe('AgentInviteService', () => {
  let service: AgentInviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentInviteService],
    }).compile();

    service = module.get<AgentInviteService>(AgentInviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
