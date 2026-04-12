import { Injectable } from '@nestjs/common'
import { TocOrderRepository } from 'src/toc-order/toc-order.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
import { RateRuleRepository } from 'src/rate-rule/rate-rule.repository'
import { decryptWechatData } from 'src/utils/decryptWechatData'
import { termToMs } from 'src/utils/vipComputer'
import { VipOrderRepository } from 'src/vip-order/vip-order.repository'

@Injectable()
export class NotifyService {
  constructor(
    private tocOrderRepo: TocOrderRepository,
    private userRepo: UserRepository,
    private pointsFlowRepo: PointsFlowRepository,
    private rateRuleRepo: RateRuleRepository,
    private vipOrderRepo: VipOrderRepository,
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
      console.log('商品订单')

      // 调用商品订单成功回调函数--具体功能请函数内部查看
      // 1.更新订单状态
      const order = await this.tocOrderRepo.statusOrderUpdate(
        outTradeNo,
        'PAID',
        result.transaction_id,
      )
      const user = await this.userRepo.findUserScore(openid)
      // 2.如果当前订单使用积分，则扣除积分消耗
      if (order.usedScore && order.usedScore > 0) {
        // 2.1 查询用户是否足够
        if (user?.score && user?.score > order.usedScore) {
          // 2.2 扣除用户积分--向上取整
          const changeDecScore = Math.ceil(order.usedScore)
          const userScore = await this.userRepo.updateUserDecScore(openid, changeDecScore)
          // 2.3 更新积分明细
          await this.pointsFlowRepo.create({
            userId: user.id,
            type: 'EXPENSE',
            amount: changeDecScore,
            balance: userScore.score,
            source: '商品购买',
          })
        }
      }
      // 3.消费返积分
      // 3.1 获取返积分比例
      const scoreRule = await this.rateRuleRepo.findAll()
      const rate = scoreRule[0].earnRate as number
      const changeIncScore = Number(order.actualPayment) * rate
      // 3.2 更新用户积分
      const userScore = await this.userRepo.updateUserIncScore(openid, changeIncScore)
      // 3.3 更新积分明细
      await this.pointsFlowRepo.create({
        userId: user?.id as string,
        type: 'INCOME',
        amount: changeIncScore,
        balance: userScore.score,
        source: '消费奖励',
      })
      // 4.TODO 查询是否有上级
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

      // 4.奖励上级佣金/积分
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
