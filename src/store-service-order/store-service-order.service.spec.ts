import { BadRequestException } from '@nestjs/common'
import { FreeBenefitSource } from '@prisma/client'
import { StoreServiceOrderService } from './store-service-order.service'

describe('StoreServiceOrderService 免费权益选择', () => {
  const tx = {} as any
  let service: StoreServiceOrderService
  let repo: any
  let userRepo: any
  let agentInviteRepo: any

  // 每个用例创建独立 Mock，避免权益占用结果相互影响
  beforeEach(() => {
    repo = {
      vipFreeOrderCreate: jest.fn().mockImplementation(
        (_no, _userId, _dto, source, claimId) => ({
          freeBenefitSource: source,
          agentInviteClaimId: claimId,
        }),
      ),
    }
    userRepo = {
      userFindByPhone: jest.fn(),
      useVipGift: jest.fn().mockResolvedValue({ count: 1 }),
    }
    agentInviteRepo = {
      findAvailableClaimByUserId: jest.fn(),
      useClaim: jest.fn().mockResolvedValue({ count: 1 }),
    }
    const prisma = { $transaction: jest.fn((callback) => callback(tx)) }

    service = new StoreServiceOrderService(
      repo,
      userRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      prisma as any,
      agentInviteRepo,
    )
  })

  // 构造免费订单请求参数
  const dto = {
    storeId: 'store-1',
    productId: 1,
    productName: '贴膜',
    productCover: '',
    skuId: 1,
    skuNo: 'SKU-1',
    originalPrice: '10.00',
    actualPayment: '0.00',
    memberPhone: '13800138000',
  }

  it('只有代理权益时使用代理邀请权益', async () => {
    userRepo.userFindByPhone.mockResolvedValue({
      id: 'user-1', role: 'USER', vipGift: 0, vipEndTime: null,
    })
    agentInviteRepo.findAvailableClaimByUserId.mockResolvedValue({
      id: 'claim-1', expiresAt: new Date(Date.now() + 86400000),
    })

    const result = await service.vipFreeOrderCreate(dto)

    expect(result.freeBenefitSource).toBe(FreeBenefitSource.AGENT_INVITE)
    expect(result.agentInviteClaimId).toBe('claim-1')
  })

  it('只有VIP权益时使用VIP权益', async () => {
    userRepo.userFindByPhone.mockResolvedValue({
      id: 'user-1', role: 'VIP', vipGift: 1,
      vipEndTime: new Date(Date.now() + 86400000),
    })
    agentInviteRepo.findAvailableClaimByUserId.mockResolvedValue(null)

    const result = await service.vipFreeOrderCreate(dto)

    expect(result.freeBenefitSource).toBe(FreeBenefitSource.VIP)
    expect(result.agentInviteClaimId).toBeNull()
  })

  it('两种权益都有时优先使用更早到期的权益', async () => {
    userRepo.userFindByPhone.mockResolvedValue({
      id: 'user-1', role: 'VIP', vipGift: 1,
      vipEndTime: new Date(Date.now() + 86400000 * 10),
    })
    agentInviteRepo.findAvailableClaimByUserId.mockResolvedValue({
      id: 'claim-1', expiresAt: new Date(Date.now() + 86400000),
    })

    const result = await service.vipFreeOrderCreate(dto)

    expect(result.freeBenefitSource).toBe(FreeBenefitSource.AGENT_INVITE)
  })

  it('没有任何可用权益时拒绝创建免费订单', async () => {
    userRepo.userFindByPhone.mockResolvedValue({
      id: 'user-1', role: 'USER', vipGift: 0, vipEndTime: null,
    })
    agentInviteRepo.findAvailableClaimByUserId.mockResolvedValue(null)

    await expect(service.vipFreeOrderCreate(dto)).rejects.toBeInstanceOf(BadRequestException)
    expect(repo.vipFreeOrderCreate).not.toHaveBeenCalled()
  })
})
