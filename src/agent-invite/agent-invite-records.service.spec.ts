import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AgentInviteBenefitStatus, AgentStatus } from '@prisma/client'
import { AgentInviteService } from './agent-invite.service'

describe('AgentInviteService.findRecords', () => {
  const now = new Date('2026-09-05T10:00:00.000Z')
  let repository: any
  let service: AgentInviteService

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now)
    repository = {
      findAgentByUserId: jest.fn(),
      countRecordsByStatus: jest.fn(),
      findRecords: jest.fn(),
      hasRecordByMobile: jest.fn(),
    }
    service = new AgentInviteService({} as any, repository)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it.each([null, { id: 'agent-1', agentCode: 'A001', status: AgentStatus.DISABLED }])(
    '拒绝无代理资格或已停用的用户',
    async agent => {
      repository.findAgentByUserId.mockResolvedValue(agent)

      await expect(service.findRecords({ userId: 'user-1' })).rejects.toBeInstanceOf(
        ForbiddenException,
      )
    },
  )

  it('返回统计、脱敏列表、实时过期状态和分页信息', async () => {
    repository.findAgentByUserId.mockResolvedValue({
      id: 'agent-1',
      agentCode: 'A001',
      status: AgentStatus.ACTIVE,
    })
    repository.countRecordsByStatus.mockResolvedValue({
      availableCount: 8,
      usedCount: 10,
      expiredCount: 2,
    })
    repository.findRecords.mockResolvedValue([
      [
        {
          id: 'claim-1',
          claimedAt: new Date('2026-08-01T10:00:00.000Z'),
          expiresAt: new Date('2026-09-01T10:00:00.000Z'),
          benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
          usedAt: null,
          invitee: { mobile: '13800000800' },
        },
      ],
      11,
    ])
    repository.hasRecordByMobile.mockResolvedValue(true)

    const result = await service.findRecords({
      userId: 'user-1',
      mobile: '0800',
      benefitStatus: AgentInviteBenefitStatus.EXPIRED,
      pageNum: 1,
      pageSize: 10,
    })

    expect(result.summary).toEqual({
      totalInvited: 20,
      availableCount: 8,
      usedCount: 10,
      expiredCount: 2,
    })
    expect(result.list[0]).toMatchObject({
      claimId: 'claim-1',
      mobile: '138****0800',
      benefitStatus: AgentInviteBenefitStatus.EXPIRED,
      usedAt: null,
    })
    expect(result).toMatchObject({ total: 11, pageNum: 1, pageSize: 10, hasMore: true })
    expect(result.mobileMatched).toBe(true)
  })

  it('未传手机号时不执行手机号匹配查询', async () => {
    repository.findAgentByUserId.mockResolvedValue({
      id: 'agent-1',
      agentCode: 'A001',
      status: AgentStatus.ACTIVE,
    })
    repository.countRecordsByStatus.mockResolvedValue({
      availableCount: 0,
      usedCount: 0,
      expiredCount: 0,
    })
    repository.findRecords.mockResolvedValue([[], 0])

    const result = await service.findRecords({ userId: 'user-1' })

    expect(result.mobileMatched).toBeNull()
    expect(repository.hasRecordByMobile).not.toHaveBeenCalled()
    expect(result).toMatchObject({ total: 0, pageNum: 1, pageSize: 10, hasMore: false })
  })

  it('后台允许查询已停用代理的历史邀请记录', async () => {
    repository.findAgentByUserId.mockResolvedValue({
      id: 'agent-1',
      agentCode: 'A001',
      status: AgentStatus.DISABLED,
    })
    repository.countRecordsByStatus.mockResolvedValue({
      availableCount: 0,
      usedCount: 1,
      expiredCount: 0,
    })
    repository.findRecords.mockResolvedValue([[], 1])

    const result = await service.findAdminRecords({ userId: 'user-1' })

    expect(result.agentCode).toBe('A001')
    expect(result.summary.totalInvited).toBe(1)
  })

  it('后台查询不存在的代理时返回404异常', async () => {
    repository.findAgentByUserId.mockResolvedValue(null)

    await expect(service.findAdminRecords({ userId: 'user-1' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})
