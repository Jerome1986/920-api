import { BadRequestException, Injectable } from '@nestjs/common'
import { OrderRepository } from 'src/order/order.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
import { RateRuleRepository } from 'src/rate-rule/rate-rule.repository'
import { decryptWechatData } from 'src/utils/decryptWechatData'
import { termToMs } from 'src/utils/vipComputer'
import { VipOrderRepository } from 'src/vip-order/vip-order.repository'
import { CommissionRuleRepository } from 'src/commission-rule/commission-rule.repository'
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service'
import { StoreTransactionRepository } from 'src/store-transaction/store-transaction.repository'
import { ParamsStoreBizType, ParamsStoreTransactionType } from 'src/store-transaction/dto/create-store-transaction.dto'
import { SettlementRecordRepository } from 'src/settlement-record/settlement-record.repository'
import { SettlementStatusDto } from 'src/settlement-record/dto/create-settlement-record.dto'
import { CommissionRuleService } from 'src/commission-rule/commission-rule.service'

@Injectable()
export class NotifyService {
  constructor(
    private tocOrderRepo: OrderRepository,
    private userRepo: UserRepository,
    private pointsFlowRepo: PointsFlowRepository,
    private rateRuleRepo: RateRuleRepository,
    private vipOrderRepo: VipOrderRepository,
    private commissionRuleRepo: CommissionRuleRepository,
    private storeTransactionRepo: StoreTransactionRepository,
    private settlementRecordRepo: SettlementRecordRepository,
    private commissionRuleService: CommissionRuleService,
    private prisma: PrismaService
  ) { }

  // 微信统一支付回调
  async wxNotify(data: any) {
    const key = process.env.API_V3_KEY
    console.log('key', key)
    if (!key) throw new Error('API_V3_KEY 未配置')
    // 获取回调参数
    const { associated_data, ciphertext, nonce } = data.resource
    // 调用解密函数
    const result = decryptWechatData(process.env.API_V3_KEY, associated_data, ciphertext, nonce)

    console.log('支付成功回调', result)
    let openid = result.payer.openid
    const outTradeNo = result.out_trade_no

    // ============================== 处理商品订单回调 ==============================
    if (result.trade_state === 'SUCCESS' && result.out_trade_no.startsWith('PRO')) {
      // 调用商品订单成功回调函数
      // 1.更新订单状态
      const order = await this.tocOrderRepo.statusOrderUpdate(
        outTradeNo,
        'PAID',
        result.transaction_id,
      )
      // 查询用户积分
      const user = await this.userRepo.findUserScore(openid)
      if (!user) {
        throw new BadRequestException('当前用户不存在')
      }

      // 开启事务
      try {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // 2.如果当前订单使用积分，则扣除积分消耗
          if (order.usedScore && order.usedScore > 0) {
            console.log('进入积分')

            // 2.1 查询用户是否足够
            if (user?.score && user?.score > order.usedScore) {
              // 2.2 扣除用户积分--向上取整
              const changeDecScore = Math.ceil(order.usedScore)
              console.log('积分抵扣', changeDecScore)
              const updatedScoreUser = await this.userRepo.updateUserDecScore(openid, changeDecScore, tx)
              // 2.3 更新积分明细
              await this.pointsFlowRepo.create({
                userId: user.id,
                type: 'EXPENSE',
                amount: changeDecScore,
                balance: updatedScoreUser.score,
                source: '商品购买',
              }, tx)
            } else {
              throw new BadRequestException('积分不足')
            }
          }

          // 3.商品为平台消费，记录门店流水，平台ID为cmnyglwkl0001wkj0p7os6u8c
          const dataDto = {
            storeId: 'cmnyglwkl0001wkj0p7os6u8c',
            consumerId: user.id,
            type: ParamsStoreTransactionType.INCOME,
            bizType: ParamsStoreBizType.PRODUCT,
            amount: order.actualPayment.toString(),
            relatedOrderId: order.outTradeNo,
            remark: '平台商品消费'
          }
          await this.storeTransactionRepo.create(dataDto, tx)

          // 4.结算表--分钱规则(当前为平台订单，所以比例100%，店长收入为0)
          const settlementRecordData = {
            storeId: 'cmnyglwkl0001wkj0p7os6u8c',
            managerId: 'cmnyglwkl0001wkj0p7os6u8c',
            orderId: order.id,
            orderAmount: order.actualPayment.toString(),
            platformRate: '1',
            platformFee: order.actualPayment.toString(),
            managerIncome: '0',
            status: SettlementStatusDto.PENDING,
          }

          await this.settlementRecordRepo.create(settlementRecordData, tx)

          // 5.记录佣金流水表
          await this.commissionRuleService.settleOrderCommission(
            order.userId,
            order.id,
            Number(order.actualPayment),
            tx
          )
        })
      } catch (err) {
        throw new BadRequestException('积分/佣金计算错误')
      }
    }

    // ============================== 处理会员订单回调 ==============================
    if (result.trade_state === 'SUCCESS' && result.out_trade_no.startsWith('VIP')) {
      console.log('会员回调')
      // 1.更新订单状态
      const vipOrder = await this.vipOrderRepo.statusOrderUpdate(
        outTradeNo,
        'PAID',
        result.transaction_id,
      )
      // 2.查询用户信息
      const userInfo = await this.userRepo.findOne(vipOrder.userId)
      // 支付成功时间转为 Date
      const payTime = new Date(result.success_time)
      let vipStartTime = userInfo?.vipStartTime ? new Date(userInfo.vipStartTime) : null
      let vipEndTime = userInfo?.vipEndTime ? new Date(userInfo.vipEndTime) : null
      const termMs = termToMs(vipOrder.term)
      if (!vipEndTime || new Date() > vipEndTime) {
        // 首次开通 or 已过期
        vipStartTime = payTime
        vipEndTime = new Date(payTime.getTime() + termMs)
      } else {
        // 续费（在有效期内）
        vipEndTime = new Date(vipEndTime.getTime() + termMs)
      }

      // 3.更新用户信息
      await this.userRepo.updateUserByVip(
        userInfo?.id,
        vipOrder.maxUsers,
        vipOrder.vipLevel,
        vipOrder.limit,
        vipOrder.discount,
        vipStartTime,
        vipEndTime,
      )
    }
  }

  // 微信退款回调
  async wxRefund(data: any) {
    const key = process.env.API_V3_KEY
    console.log('key', key)
    if (!key) throw new Error('API_V3_KEY 未配置')
    // 获取回调参数
    const { associated_data, ciphertext, nonce } = data.resource
    // 调用解密函数
    const decryptedData = decryptWechatData(key, associated_data, ciphertext, nonce)
    console.log('解密', decryptedData)
    const outTradeNo = decryptedData.out_trade_no
    // 如果回调结果为 SUCCESS 说明退款已成功，则同步更新订单状态
    if (decryptedData.refund_status === 'SUCCESS') {
      console.log('更新订单')

      const refundOrder = await this.tocOrderRepo.statusOrderUpdate(outTradeNo, 'REFUNDED')
      console.log('更新结果', refundOrder)
    }
  }
}
