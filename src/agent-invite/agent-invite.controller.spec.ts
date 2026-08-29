import { Test, TestingModule } from '@nestjs/testing';
import { AgentInviteController } from './agent-invite.controller';
import { AgentInviteService } from './agent-invite.service';

describe('AgentInviteController', () => {
  let controller: AgentInviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentInviteController],
      providers: [AgentInviteService],
    }).compile();

    controller = module.get<AgentInviteController>(AgentInviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
