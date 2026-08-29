import { BadRequestException, ConflictException, HttpException, Injectable } from '@nestjs/common'
import { CreateStoreServiceOrderDto } from './dto/create-store-service-order.dto'
import { UpdateStoreServiceOrderDto } from './dto/update-store-service-order.dto'
import { StoreServiceOrderRepository } from './store-service-order.repository'
import { WechatSign } from "src/utils/wechat-sign"
import { getPrivateKey, nativeWechatOrder } from "src/utils/wechat-pay"
import QRCode from 'qrcode'
import { FreeBenefitSource, Prisma, ServiceOrderStatus } from '@prisma/client'
import { FreeStoreServiceOrderDto } from './dto/free-store-service-order.dto'
import { UserRepository } from 'src/user/user.repository'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { PrismaService } from 'src/prisma/prisma.service'
import { ParamsStoreBizType, ParamsStoreTransactionType } from 'src/store-transaction/dto/create-store-transaction.dto'
import { StoreTransactionRepository } from 'src/store-transaction/store-transaction.repository'
import { CommissionRuleService } from 'src/commission-rule/commission-rule.service'
import { CommissionSourceParams, StoreBizTypeParams } from 'src/commission-rule/dto/create-commission-rule.dto'
import { CommissionRuleRepository } from 'src/commission-rule/commission-rule.repository'
import { SettlementRecordRepository } from 'src/settlement-record/settlement-record.repository'
import { SettlementStatusDto } from 'src/settlement-record/dto/create-settlement-record.dto'
import { WalletRepository } from 'src/wallet/wallet.repository'
import { WalletBizTypeDto, WalletTransactionTypeDto } from 'src/wallet-transaction/dto/create-wallet-transaction.dto'
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository'
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository'
import { StoreServiceOrderStatus } from './dto/query-store-service-order.dto'
import { yuanToFen } from 'src/utils/money'
import { AgentInviteRepository } from 'src/agent-invite/agent-invite.repository'

@Injectable()
export class StoreServiceOrderService {
  constructor(
    private repo: StoreServiceOrderRepository,
    private userRepo: UserRepository,
    private storeInventoryRepo: StoreInventoryRepositroy,
    private storeTransactionRepo: StoreTransactionRepository,
    private commissionRuleRepo: CommissionRuleRepository,
    private settlementRecordRepo: SettlementRecordRepository,
    private walletRepo: WalletRepository,
    private wallettransactionRepo: WallettransactionRepository,
    private prisma: PrismaService,
    private agentInviteRepo: AgentInviteRepository
  ) { }

  // 创建订单
  async create(createStoreServiceOrderDto: CreateStoreServiceOrderDto) {
    // 1.创建订单
    const order = await this.repo.create(createStoreServiceOrderDto)
    if (!order) throw new BadRequestException('订单创建失败')
    // 2.创建支付码
    // 2.1 构建参数
    const body = {
      appid: process.env.APPID,
      mchid: process.env.MCH_ID,
      description: order.remark ?? '贴膜服务',
      out_trade_no: order.outTradeNo,
      notify_url: process.env.NOTIFY_URL,
      amount: {
        total: yuanToFen(order.actualPayment), // 单位分
        currency: 'CNY'
      }
    }
    const requestPath = '/v3/pay/transactions/native'
    const requestBody = JSON.stringify(body)

    // 2.2 调用微信支付签名工具类
    const signer = new WechatSign({
      mchid: process.env.MCH_ID as string,
      serialNo: process.env.SERIALNO as string,
      privateKey: getPrivateKey(),
    })

    // 2.3 生成请求签名（用于调用微信接口）
    const { timestamp, nonceStr, signature } = signer.nativeSign(
      'POST',
      requestPath,
      requestBody
    )

    // 2.4 请求微信Native下单--返回二维码链接支付
    const res = await nativeWechatOrder(
      requestBody,
      process.env.MCH_ID as string,
      nonceStr,
      timestamp,
      process.env.SERIALNO as string,
      signature
    )

    if (!res) throw new BadRequestException('下单码创建失败')

    if (res.status === 200) {
      // 2.5 将返回的链接转换成二维码
      const codeUrl = res.data.code_url
      const qrBase64 = await QRCode.toDataURL(codeUrl)
      return {
        codeUrl: qrBase64,
        outTradeNo: body.out_trade_no
      }
    }
  }

  // 创建会员免费服务订单
  async vipFreeOrderCreate(freeStoreServiceOrderDto: FreeStoreServiceOrderDto) {
    const outTradeNo = generateOrderNo('FREESERVICE')
    const now = new Date()

    // 1. 在同一事务内重新查询、占用权益并创建免费订单
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await this.userRepo.userFindByPhone(freeStoreServiceOrderDto.memberPhone, tx)
      if (!user) throw new BadRequestException('用户未注册')

      // 2. 查询当前可用的代理权益和 VIP 权益
      const agentClaim = await this.agentInviteRepo.findAvailableClaimByUserId(user.id, now, tx)
      const vipEndTime = user.vipEndTime ? new Date(user.vipEndTime) : null
      const vipAvailable = user.role === 'VIP'
        && Number(user.vipGift) > 0
        && vipEndTime !== null
        && vipEndTime > now

      if (!agentClaim && !vipAvailable) {
        throw new BadRequestException('当前没有可用的免费贴膜权益')
      }

      // 3. 两种权益同时存在时优先使用更早到期的权益，到期时间相同则代理权益优先
      const useAgentInvite = Boolean(
        agentClaim
        && (!vipAvailable || !vipEndTime || agentClaim.expiresAt <= vipEndTime),
      )
      let freeBenefitSource = useAgentInvite
        ? FreeBenefitSource.AGENT_INVITE
        : FreeBenefitSource.VIP
      let agentInviteClaimId: string | null = useAgentInvite && agentClaim ? agentClaim.id : null

      // 4. 使用条件更新原子占用选中的权益，防止并发重复使用
      if (useAgentInvite && agentClaim) {
        const result = await this.agentInviteRepo.useClaim(agentClaim.id, now, tx)
        if (result.count !== 1) {
          // 首选代理权益被并发占用时，尝试使用同时存在的有效 VIP 权益
          if (!vipAvailable) throw new BadRequestException('当前没有可用的免费贴膜权益')
          const vipResult = await this.userRepo.useVipGift(user.id, now, tx)
          if (vipResult.count !== 1) throw new BadRequestException('当前没有可用的免费贴膜权益')
          freeBenefitSource = FreeBenefitSource.VIP
          agentInviteClaimId = null
        }
      } else {
        const result = await this.userRepo.useVipGift(user.id, now, tx)
        if (result.count !== 1) {
          // 首选 VIP 权益被并发占用时，尝试使用同时存在的有效代理权益
          if (!agentClaim) throw new BadRequestException('当前没有可用的免费贴膜权益')
          const agentResult = await this.agentInviteRepo.useClaim(agentClaim.id, now, tx)
          if (agentResult.count !== 1) throw new BadRequestException('当前没有可用的免费贴膜权益')
          freeBenefitSource = FreeBenefitSource.AGENT_INVITE
          agentInviteClaimId = agentClaim.id
        }
      }

      // 5. 创建免费订单并记录权益来源，事务失败时自动回滚权益占用
      return this.repo.vipFreeOrderCreate(
        outTradeNo,
        user.id,
        freeStoreServiceOrderDto,
        freeBenefitSource,
        agentInviteClaimId,
        now,
        tx,
      )
    })
  }

  // 会员免费订单完成
  async vipFreeOrderCompleted(outTradeNo: string, status: ServiceOrderStatus) {
    if (status !== ServiceOrderStatus.COMPLETED) {
      throw new BadRequestException('免费订单完成状态错误')
    }

    try {
      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 查询订单并校验免费订单状态，重复完成时直接幂等返回
        let freeOrder = await this.repo.findOne(outTradeNo, tx)
        if (!freeOrder) throw new BadRequestException('免费订单不存在')
        if (freeOrder.status === ServiceOrderStatus.COMPLETED) return freeOrder
        if (freeOrder.status === ServiceOrderStatus.CANCELLED) {
          throw new ConflictException('已取消订单不能完成')
        }

        const isLegacyFreeOrder = freeOrder.outTradeNo.startsWith('FREESERVICE')
          && freeOrder.freeBenefitSource === null
        if (!freeOrder.freeBenefitSource && !isLegacyFreeOrder) {
          throw new BadRequestException('当前订单不是免费订单')
        }

        // 2. 新免费订单仅允许服务中完成；历史免费订单兼容 PAID 状态
        const allowedStatuses = isLegacyFreeOrder
          ? [ServiceOrderStatus.PAID, ServiceOrderStatus.IN_SERVICE]
          : [ServiceOrderStatus.IN_SERVICE]
        const completeResult = await this.repo.updateStatusWhen(
          outTradeNo,
          allowedStatuses,
          ServiceOrderStatus.COMPLETED,
          tx,
        )
        if (completeResult.count !== 1) {
          const latestOrder = await this.repo.findOne(outTradeNo, tx)
          if (latestOrder?.status === ServiceOrderStatus.COMPLETED) return latestOrder
          throw new ConflictException('当前订单状态不可完成')
        }
        freeOrder = (await this.repo.findOne(outTradeNo, tx))!

        // 3. 仅历史空来源免费订单继续沿用完成时扣减 VIP 的旧逻辑
        const userId = freeOrder.userId
        if (!userId) throw new BadRequestException('用户会员信息错误')
        if (isLegacyFreeOrder) await this.userRepo.decVipGift(userId, tx)

        // 4.获取商品成本
        const skuId = freeOrder.skuId
        const storeId = freeOrder.storeId
        const sku = await this.storeInventoryRepo.findOneStock(storeId, skuId, tx)
        if (!sku) throw new BadRequestException('当前库存没有该商品')

        // 5.记录门店业务流水
        const dataDto = {
          storeId: freeOrder.storeId,
          consumerId: userId,
          type: ParamsStoreTransactionType.INCOME,
          bizType: ParamsStoreBizType.SERVICE,
          amount: sku.costPrice.toString(),
          relatedOrderId: freeOrder.outTradeNo,
          remark: '免费贴膜'
        }
        await this.storeTransactionRepo.create(dataDto, tx)

        // 6.记录结算
        const totalAmount = Number(sku.costPrice)
        const manager = await this.userRepo.findUserIdByShop(freeOrder.storeId)
        if (!manager) throw new BadRequestException('该门店还没有设置店长')
        // 6.1 获取抽成比例
        const rate = await this.commissionRuleRepo.findAll()
        const platformRate = rate[0].platformRate.toFixed(2)
        const platformFee = totalAmount * Number(platformRate)
        const managerIncome = totalAmount - platformFee
        // 6.2 计算结算表
        const settlement = await this.settlementRecordRepo.create({
          storeId: freeOrder.storeId,
          managerId: manager.id,

          orderId: freeOrder.id,
          orderAmount: totalAmount.toFixed(2),

          platformRate: (platformFee / totalAmount).toFixed(2),
          platformFee: platformFee.toFixed(2),

          managerIncome: managerIncome.toFixed(2),

          totalCommission: '0.00',

          status: SettlementStatusDto.SETTLED,
        }, tx)

        // 7.更新钱包余额
        // 7.1 更新门店余额
        const wallet = await this.walletRepo.incrementBalance(manager.id, Number(managerIncome), tx)
        // 7.2 准备钱包流水参数--业务进账
        const data = {
          userId: wallet?.userId,
          type: WalletTransactionTypeDto.IN,
          bizType: WalletBizTypeDto.SETTLEMENT,
          amount: Number(managerIncome),
          balanceAfter: Number(wallet.balance),
          relatedId: settlement.id,
          remark: '会员免费贴膜'
        }
        await this.wallettransactionRepo.create(data, tx)

        return freeOrder
      })

      // 返回给前端
      return {
        outTradeNo,
        status: result.status
      }
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw new BadRequestException('服务器错误')
    }
  }

  // 获取所有线下贴膜订单
  async findAll(status: StoreServiceOrderStatus, pageNum: number, pageSize: number, keyword: string) {
    const [list, total] = await this.repo.findAll(status, pageNum, pageSize, keyword)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 订单详情
  async findOne(outTradeNo: string) {
    return this.repo.findOne(outTradeNo)
  }

  // 更新订单状态
  async updateOrder(outTradeNo: string, status: ServiceOrderStatus) {
    // 1. 非取消操作保持原有订单更新逻辑不变
    if (status !== ServiceOrderStatus.CANCELLED) {
      return this.repo.updateOrder(outTradeNo, status)
    }

    // 2. 取消免费订单时，在同一事务内更新状态并原路返还权益
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await this.repo.findOne(outTradeNo, tx)
      if (!order) throw new BadRequestException('订单不存在')

      const isLegacyFreeOrder = order.outTradeNo.startsWith('FREESERVICE')
        && order.freeBenefitSource === null

      // 3. 普通付费订单保持原有取消行为，不执行免费权益返还
      if (!order.freeBenefitSource && !isLegacyFreeOrder) {
        return this.repo.updateOrder(outTradeNo, status, '', tx)
      }

      if (order.status === ServiceOrderStatus.CANCELLED) return order
      if (order.status === ServiceOrderStatus.COMPLETED) {
        throw new ConflictException('已完成订单不能取消')
      }

      // 4. 新旧免费订单仅允许从 PAID 或 IN_SERVICE 状态取消
      const cancelResult = await this.repo.updateStatusWhen(
        outTradeNo,
        [ServiceOrderStatus.PAID, ServiceOrderStatus.IN_SERVICE],
        ServiceOrderStatus.CANCELLED,
        tx,
      )
      if (cancelResult.count !== 1) {
        throw new ConflictException('当前订单状态不可取消')
      }

      // 5. 历史免费订单未预扣权益，取消时无需返还
      if (isLegacyFreeOrder) return this.repo.findOne(outTradeNo, tx)

      if (!order.userId) throw new BadRequestException('免费订单用户信息错误')
      if (order.freeBenefitSource === FreeBenefitSource.VIP) {
        await this.userRepo.restoreVipGift(order.userId, tx)
      } else if (order.freeBenefitSource === FreeBenefitSource.AGENT_INVITE) {
        if (!order.agentInviteClaimId) throw new BadRequestException('代理权益记录错误')
        const restoreResult = await this.agentInviteRepo.restoreClaim(
          order.agentInviteClaimId,
          new Date(),
          tx,
        )
        if (restoreResult.count !== 1) throw new BadRequestException('代理权益返还失败')
      }

      // 6. 返回取消后的最新订单信息
      return this.repo.findOne(outTradeNo, tx)
    })
  }
}
