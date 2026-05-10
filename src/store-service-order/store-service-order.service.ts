import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateStoreServiceOrderDto } from './dto/create-store-service-order.dto'
import { UpdateStoreServiceOrderDto } from './dto/update-store-service-order.dto'
import { StoreServiceOrderRepository } from './store-service-order.repository'
import { WechatSign } from "src/utils/wechat-sign"
import { getPrivateKey, nativeWechatOrder } from "src/utils/wechat-pay"
import QRCode from 'qrcode'
import { Prisma, ServiceOrderStatus } from '@prisma/client'
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
    private prisma: PrismaService
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
        total: 1, // Number(order.actualPayment) * 100
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
    const user = await this.userRepo.userFindByPhone(freeStoreServiceOrderDto.memberPhone)
    if (!user) throw new BadRequestException('用户未注册')
    const freeOrder = await this.repo.vipFreeOrderCreate(outTradeNo, user.id, freeStoreServiceOrderDto)
    return freeOrder
  }

  // 会员免费订单完成
  async vipFreeOrderCompleted(outTradeNo: string, status: ServiceOrderStatus) {
    try {
      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.更新订单状态
        const freeOrder = await this.repo.updateOrder(outTradeNo, status, '', tx)

        // 2.扣除会员免费次数
        const userId = freeOrder.userId
        if (!userId) throw new BadRequestException('用户会员信息错误')
        await this.userRepo.decVipGift(userId, tx)

        // 3.获取商品成本
        const skuId = freeOrder.skuId
        const storeId = freeOrder.storeId
        const sku = await this.storeInventoryRepo.findOneStock(storeId, skuId, tx)
        if (!sku) throw new BadRequestException('当前库存没有该商品')

        // 4.记录门店业务流水
        const dataDto = {
          storeId: freeOrder.storeId,
          consumerId: userId,
          type: ParamsStoreTransactionType.INCOME,
          bizType: ParamsStoreBizType.SERVICE,
          amount: sku.costPrice.toString(),
          relatedOrderId: freeOrder.outTradeNo,
          remark: '会员免费贴膜'
        }
        await this.storeTransactionRepo.create(dataDto, tx)

        // 5.记录结算
        const totalAmount = Number(sku.costPrice)
        const manager = await this.userRepo.findUserIdByShop(freeOrder.storeId)
        if (!manager) throw new BadRequestException('该门店还没有设置店长')
        // 5.1 获取抽成比例
        const rate = await this.commissionRuleRepo.findAll()
        const platformRate = rate[0].platformRate.toFixed(2)
        const platformFee = totalAmount * Number(platformRate)
        const managerIncome = totalAmount - platformFee
        // 5.2 计算结算表
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

        // 6.更新钱包余额
        // 6.1 更新门店余额
        const wallet = await this.walletRepo.incrementBalance(manager.id, Number(managerIncome), tx)
        // 6.2 准备钱包流水参数--业务进账
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
      throw new BadRequestException('服务器错误')
    }
  }

  findAll() {
    return `This action returns all storeServiceOrder`;
  }

  // 订单详情
  async findOne(outTradeNo: string) {
    return this.repo.findOne(outTradeNo)
  }

  update(id: number, updateStoreServiceOrderDto: UpdateStoreServiceOrderDto) {
    return `This action updates a #${id} storeServiceOrder`;
  }

  // 更新订单状态
  async updateOrder(outTradeNo: string, status: ServiceOrderStatus) {
    return this.repo.updateOrder(outTradeNo, status)
  }
}
