import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { OrderRepository } from './order.repository'
import { OrderProductRepository } from 'src/order-product/order-product.repository'
import { CreateOrderProductDto } from 'src/order-product/dto/create-order-product.dto'
import { OrderAddressRepository } from 'src/order-address/order-address.repository'
import { PrismaService } from 'src/prisma/prisma.service'
import { OrderStatus, Prisma } from '@prisma/client'
import { PaymentRepository } from 'src/payment/payment.repository'
import { OrderQueryStatus, QueryTarget } from './dto/query-order.dto'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { CancelOrderDto } from './dto/cancel-order.dto'
import { WechatSign } from 'src/utils/wechat-sign'
import { getPrivateKey, refundWxchatPay } from 'src/utils/wechat-pay'
import * as crypto from 'crypto'
import { RateRuleRepository } from 'src/rate-rule/rate-rule.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
import { CommissionRuleRepository } from 'src/commission-rule/commission-rule.repository'
import { CommissionRuleService } from 'src/commission-rule/commission-rule.service'
import { SettlementRecordRepository } from 'src/settlement-record/settlement-record.repository'
import { WalletRepository } from 'src/wallet/wallet.repository'
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository'
import { WalletBizTypeDto, WalletTransactionTypeDto } from 'src/wallet-transaction/dto/create-wallet-transaction.dto'
import { SettlementStatusDto } from 'src/settlement-record/dto/create-settlement-record.dto'
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository'
import { ProductSkuRepository } from 'src/product-sku/product-sku.repository'

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private repo: OrderRepository,
    private orderProducntRepo: OrderProductRepository,
    private orderAddressRepo: OrderAddressRepository,
    private wxPayRepo: PaymentRepository,
    private rateRuleRepo: RateRuleRepository,
    private userRepo: UserRepository,
    private pointsFlowRepo: PointsFlowRepository,
    private settlementRecordRepo: SettlementRecordRepository,
    private commissionRuleRepo: CommissionRuleRepository,
    private walletRepo: WalletRepository,
    private wallettransactionRepo: WallettransactionRepository,
    private storeInventoryRepo: StoreInventoryRepositroy,
    private productSkuRepo: ProductSkuRepository
  ) { }

  // 商品订单创建-支付订单
  async create(orderDto: CreateOrderDto) {
    const { products, addressInfo } = orderDto
    try {
      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.创建订单
        const order = await this.repo.create(orderDto, tx)
        // 2.创建订单商品
        await this.orderProducntRepo.createManyProducts(
          order.id,
          products as CreateOrderProductDto[],
          tx,
        )
        // 3.创建订单收货地址
        await this.orderAddressRepo.createOrderAddress(order.id, addressInfo, tx)

        return order
      })

      // 4.事务结束调用支付
      const payRes = await this.wxPayRepo.wxPay(
        result.remark as string,
        result.outTradeNo,
        result.openid,
      )
      return payRes
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  // 获取所有订单
  async findAll(status: OrderQueryStatus, target: QueryTarget, pageNum: number, pageSize: number) {
    const [list, total] = await this.repo.findAll(status, target, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 获取指定用户所有订单
  async findUserOrder(userId: string, status: OrderQueryStatus, target: QueryTarget, pageNum: number, pageSize: number) {
    const [list, total] = await this.repo.findUserOrder(userId, status, target, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 更新指定订单状态
  async statusOrderUpdate(outTradeNo: string, status: OrderStatus) {
    if (status === 'COMPLETED') {
      return this.completeOrder(outTradeNo)
    }

    return this.repo.statusOrderUpdate(outTradeNo, status)
  }

  // 用户确认收货
  async updateOrderCompleted(outTradeNo: string, userId: string) {
    return this.completeOrder(outTradeNo, userId)
  }

  private async completeOrder(outTradeNo: string, userId?: string) {
    // 1.验证订单
    const order = await this.repo.findOne(outTradeNo)
    if (!order) throw new BadRequestException('订单不存在')
    if (userId && order.userId !== userId) throw new BadRequestException('用户订单不匹配')

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('订单已完成，请勿重复操作')
    }

    if (order.status !== 'SHIPPED') {
      throw new BadRequestException('订单不能确认收货')
    }

    //开启事务
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const orderUserId = order.userId
      // 2.更新并返回
      const updateOrderRes = await this.repo.updateOrderCompleted(outTradeNo, userId, tx)
      if (!updateOrderRes) throw new BadRequestException('订单更新错误')

      // 3.消费返积分
      // 3.1 获取返积分比例
      const scoreRule = await this.rateRuleRepo.findAll(tx)
      const rate = scoreRule[0].earnRate as number
      const changeIncScore = Math.floor(Number(order.actualPayment) * rate)
      // 3.2 更新用户积分
      const user = await this.userRepo.updateUserIncScore(orderUserId, changeIncScore, tx)
      // 3.3 更新积分明细
      await this.pointsFlowRepo.create({
        userId: orderUserId,
        type: 'INCOME',
        amount: changeIncScore,
        balance: user.score,
        source: '消费奖励',
      }, tx)

      // 4.读取结算 & 佣金
      const settlement = await this.settlementRecordRepo.findOne(updateOrderRes.id, tx)
      if (settlement?.status !== 'PENDING') throw new BadRequestException('佣金结算错误')
      const commissions = await this.commissionRuleRepo.findCommissionRecord(updateOrderRes.id, tx)
      const totalCommission = commissions.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      )

      // 5.平台钱包入账
      // 5.1 更新余额
      const wallet = await this.walletRepo.incrementBalance('1001', Number(settlement.orderAmount), tx)
      // 5.2 准备钱包流水参数--业务进账
      const data = {
        userId: wallet?.userId ?? '1001',
        type: WalletTransactionTypeDto.IN,
        bizType: WalletBizTypeDto.SETTLEMENT,
        amount: Number(settlement.orderAmount),
        balanceAfter: Number(wallet.balance),
        relatedId: settlement.id,
        remark: '订单收入'
      }
      await this.wallettransactionRepo.create(data, tx)

      // 6.如果佣金存在
      if (totalCommission > 0) {
        // 6.1 扣佣金
        const decrementWallet = await this.walletRepo.decrementBalance('1001', totalCommission, tx)
        // 6.2 写流水
        await this.wallettransactionRepo.create({
          userId: '1001',
          type: WalletTransactionTypeDto.OUT,
          bizType: WalletBizTypeDto.COMMISSION,
          amount: totalCommission,
          balanceAfter: Number(decrementWallet.balance),
          relatedId: settlement.id,
          remark: '佣金支出'
        }, tx)

        // 6.3 上级发佣金
        for (const commission of commissions) {
          const userWallet = await this.walletRepo.incrementBalance(
            commission.userId,
            Number(commission.amount),
            tx
          )

          await this.wallettransactionRepo.create({
            userId: commission.userId,
            type: WalletTransactionTypeDto.IN,
            bizType: WalletBizTypeDto.COMMISSION,
            amount: Number(commission.amount),
            balanceAfter: Number(userWallet.balance),
            relatedId: commission.id,
            remark: '佣金收入'
          }, tx)
        }

        // 6.4 更新佣金流水状态
        await this.commissionRuleRepo.updateCommissionRecordByStatus(
          updateOrderRes.id,
          'SETTLED',
          tx
        )
      }

      // 7.更新结算流水状态
      await this.settlementRecordRepo.updateStatus(
        updateOrderRes.id,
        SettlementStatusDto.SETTLED,
        tx
      )

      // 8.如果是TOB，则需要将商品同步至门店库存
      if (updateOrderRes.target === 'TOB') {
        console.log('订单商品', order.products)
        if (!user.storeId) throw new BadRequestException('当前店长未绑定门店，无法同步库存')

        for (const product of order.products) {
          if (!product.skuId) throw new BadRequestException(`订单商品 ${product.name} 缺少 SKU，无法同步库存`)
          // 8.1 查 SKU 信息
          const sku = await this.productSkuRepo.findUnique(product.skuId, tx)
          if (!sku) throw new Error(`SKU ${product.skuId} 不存在`)
          // 8.2 upsert 门店库存
          await this.storeInventoryRepo.incrementStock(
            user.storeId,
            product.skuId,
            sku?.product.categoryId,
            product.quantity,
            Number(sku?.costPrice),
            Number(sku?.salePrice),
            tx
          )
        }
      }

      return updateOrderRes
    })
  }

  // 获取订单详情
  async findOne(outTradeNo: string) {
    return this.repo.findOne(outTradeNo)
  }

  // 取消订单
  async cancelOrder(outTradeNo: string, CancelTocOrderDto: CancelOrderDto) {
    console.log('退款金额', CancelTocOrderDto)
    // 1.退款参数
    const body = {
      out_trade_no: outTradeNo,
      out_refund_no: generateOrderNo('REFUND'),
      amount: {
        total: 1, // 本次订单实际支付金额 CancelTocOrderDto.actualPayment
        refund: 1, // 本次订单应退款金额 CancelTocOrderDto.actualPayment
        currency: 'CNY',
      },
      notify_url: process.env.REFUND_NOTIFY_URL,
    }
    const bodyStr = JSON.stringify(body)

    // 2.生成签名
    const signer = new WechatSign({
      mchid: process.env.MCH_ID as string,
      serialNo: process.env.SERIALNO as string,
      privateKey: getPrivateKey(),
    })

    // 生成请求签名（用于调用微信接口）
    const nonceStr = crypto.randomBytes(16).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const authorization = signer.signRequest(
      'POST',
      '/v3/refund/domestic/refunds',
      body,
      timestamp,
      nonceStr,
    )

    // 3.发起退款请求
    const resp = await refundWxchatPay(bodyStr, authorization)
    console.log('退款结果', resp.data)
    // 如果返回结果是 PROCESSING ，说明微信已受理退款，且状态在退款中，则同步更新本地订单状态
    if (resp.data.status === 'PROCESSING') {
      // 4.将订单状态更新为已取消
      await this.repo.statusOrderUpdate(outTradeNo, 'PROCESSING')
      // 5.查询订单是否有积分抵扣
      // 6.退还积分
    }

    return resp.data
  }
}
