import { BadRequestException, Injectable } from '@nestjs/common'
import { OrderRepository } from 'src/order/order.repository'
import { UserRepository } from 'src/user/user.repository'
import { PointsFlowRepository } from 'src/points-flow/points-flow.repository'
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
import { CommissionSourceParams, StoreBizTypeParams } from 'src/commission-rule/dto/create-commission-rule.dto'
import { StoreServiceOrderRepository } from 'src/store-service-order/store-service-order.repository'
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository'
import { WalletRepository } from 'src/wallet/wallet.repository'
import { WalletBizTypeDto, WalletTransactionTypeDto } from 'src/wallet-transaction/dto/create-wallet-transaction.dto'
import { WallettransactionRepository } from 'src/wallet-transaction/wallet-transaction.repository'

@Injectable()
export class NotifyService {
  constructor(
    private OrderRepo: OrderRepository,
    private userRepo: UserRepository,
    private pointsFlowRepo: PointsFlowRepository,
    private vipOrderRepo: VipOrderRepository,
    private commissionRuleRepo: CommissionRuleRepository,
    private storeTransactionRepo: StoreTransactionRepository,
    private settlementRecordRepo: SettlementRecordRepository,
    private commissionRuleService: CommissionRuleService,
    private storeServiceOrderRepo: StoreServiceOrderRepository,
    private storeInventoryRepo: StoreInventoryRepositroy,
    private walletRepo: WalletRepository,
    private wallettransactionRepo: WallettransactionRepository,
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
    // 查询订单 幂等校验
    const order = await this.OrderRepo.findOne(outTradeNo)
    if (order?.status === 'PAID') {
      return { return_code: 'SUCCESS', return_msg: 'OK' }
    }
    // ============================== 处理商品订单回调 ==============================
    if (result.trade_state === 'SUCCESS' && result.out_trade_no.startsWith('PRO')) {
      // 开启事务
      try {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // 1.更新订单状态
          const updateOrder = await this.OrderRepo.statusOrderUpdate(
            outTradeNo,
            'PAID',
            result.transaction_id,
            tx
          )
          // 查询用户积分
          const user = await this.userRepo.findUserScore(openid, tx)
          if (!user) {
            throw new BadRequestException('当前用户不存在')
          }

          // 2.如果当前订单使用积分，则扣除积分消耗
          if (updateOrder.usedScore && updateOrder.usedScore > 0) {
            // 2.1 查询用户是否足够
            if (user?.score && user?.score > updateOrder.usedScore) {
              // 2.2 扣除用户积分--向上取整
              const changeDecScore = Math.ceil(updateOrder.usedScore)
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
            storeId: process.env.PLATFORM_STORE_ID as string,
            consumerId: user.id,
            type: ParamsStoreTransactionType.INCOME,
            bizType: ParamsStoreBizType.PRODUCT,
            amount: updateOrder.actualPayment.toString(),
            relatedOrderId: updateOrder.outTradeNo,
            remark: '平台商品消费'
          }
          await this.storeTransactionRepo.create(dataDto, tx)

          // 4.计算佣金
          const commissionList = await this.commissionRuleService.calculateCommission(
            updateOrder.userId,
            Number(updateOrder.actualPayment),
            tx
          )

          // 5.计算结算表
          const totalAmount = Number(updateOrder.actualPayment)
          const totalCommission = commissionList.reduce((sum, i) => sum + i.amount, 0)
          const platformFee = totalAmount - totalCommission

          await this.settlementRecordRepo.create({
            storeId: process.env.PLATFORM_STORE_ID as string,
            managerId: process.env.PLATFORM_STORE_ID as string,

            orderId: updateOrder.id,
            orderAmount: totalAmount.toFixed(2),

            platformRate: (platformFee / totalAmount).toFixed(2),
            platformFee: platformFee.toFixed(2),

            managerIncome: '0.00',

            totalCommission: totalCommission.toFixed(2),

            status: SettlementStatusDto.PENDING,
          }, tx)

          console.log('平台佣金比例', (platformFee / totalAmount).toFixed(2))

          // 6.佣金明细
          await this.commissionRuleService.createCommissionRecords(
            commissionList,
            updateOrder.id,
            updateOrder.userId,
            StoreBizTypeParams.PRODUCT,
            CommissionSourceParams.PLATFORM,
            tx
          )
        })
      } catch (err) {
        console.error(err)
        throw new BadRequestException('积分/佣金计算错误')
      }
    }
    // ============================== 店长进货订单回调 ==============================
    if (result.trade_state === 'SUCCESS' && result.out_trade_no.startsWith('MANAGER')) {
      let step = 'transaction'
      try {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // 1.更新订单状态
          step = 'statusOrderUpdate'
          const order = await this.OrderRepo.statusOrderUpdate(
            outTradeNo,
            'PAID',
            result.transaction_id,
            tx
          )

          step = 'findUser'
          const user = await this.userRepo.findUserScore(openid, tx)
          if (!user) {
            throw new BadRequestException('店长进货回调失败：未找到支付用户')
          }
          if (!user.storeId) {
            throw new BadRequestException('店长进货回调失败：当前用户未绑定门店')
          }

          const platformStoreId = process.env.PLATFORM_STORE_ID
          if (!platformStoreId) {
            throw new BadRequestException('店长进货回调失败：PLATFORM_STORE_ID 未配置')
          }

          const totalAmount = Number(order.actualPayment)
          if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            throw new BadRequestException('店长进货回调失败：订单金额异常')
          }

          // 2.记录门店业务流水
          step = 'createStoreTransaction'
          const dataDto = {
            storeId: user.storeId,
            consumerId: user.id,
            type: ParamsStoreTransactionType.EXPENSE,
            bizType: ParamsStoreBizType.PURCHASE,
            amount: order.actualPayment.toString(),
            relatedOrderId: order.outTradeNo,
            remark: '个人进货'
          }
          await this.storeTransactionRepo.create(dataDto, tx)

          // 3.计算佣金
          step = 'calculateCommission'
          const commissionList = await this.commissionRuleService.calculateCommission(
            order.userId,
            totalAmount,
            tx
          )

          // 4.计算结算表
          step = 'createSettlement'
          const totalCommission = commissionList.reduce((sum, i) => sum + i.amount, 0)
          const platformFee = totalAmount - totalCommission

          await this.settlementRecordRepo.create({
            storeId: platformStoreId,
            managerId: platformStoreId,

            orderId: order.id,
            orderAmount: totalAmount.toFixed(2),

            platformRate: (platformFee / totalAmount).toFixed(2),
            platformFee: platformFee.toFixed(2),

            managerIncome: '0.00',

            totalCommission: totalCommission.toFixed(2),

            status: SettlementStatusDto.PENDING,
          }, tx)

          console.log('平台佣金比例', (platformFee / totalAmount).toFixed(2))

          // 5.佣金明细
          step = 'createCommissionRecords'
          await this.commissionRuleService.createCommissionRecords(
            commissionList,
            order.id,
            order.userId,
            StoreBizTypeParams.PRODUCT,
            CommissionSourceParams.PLATFORM,
            tx
          )
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[wxNotify][MANAGER] outTradeNo=${outTradeNo} step=${step}`, err)
        throw new BadRequestException(`店长进货支付回调处理失败：${message}`)
      }
    }

    // ============================== 线下贴膜服务订单回调 ==============================
    if (result.trade_state === 'SUCCESS' && result.out_trade_no.startsWith('SERVICE')) {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.更新订单
        const order = await this.storeServiceOrderRepo.updateOrder(result.out_trade_no, 'PAID', openid, tx)
        // 1.1 查询订单商品对应的库存
        const inventoryStock = await this.storeInventoryRepo.findOneStock(order.storeId, order.skuId, tx)
        if (!inventoryStock) throw new BadRequestException('当前商品已售空')

        // 2.根据openid查询用户，查询消费者是否为平台用户
        const consumer = await this.userRepo.findUserByOpenid(openid)
        console.log('消费者用户', consumer)

        // 3.记录门店业务流水
        const dataDto = {
          storeId: order.storeId,
          consumerId: consumer?.id ?? openid,
          type: ParamsStoreTransactionType.INCOME,
          bizType: ParamsStoreBizType.SERVICE,
          amount: order.actualPayment.toString(),
          relatedOrderId: order.outTradeNo,
          remark: '线下贴膜服务'
        }
        await this.storeTransactionRepo.create(dataDto, tx)

        // 4.给门店上级返佣
        // 4.1 根据门店ID拿到店长ID
        const manager = await this.userRepo.findUserIdByShop(order.storeId)
        if (!manager) throw new BadRequestException('该门店还没有设置店长')
        // 4.2 计算佣金
        const commissionList = await this.commissionRuleService.calculateCommission(
          manager.id,
          Number(order.actualPayment),
          tx
        )
        // 如果有佣金
        if (commissionList.length) {
          // 4.3 记录佣金流水
          await this.commissionRuleService.createCommissionRecords(
            commissionList,
            order.id,
            manager?.id,
            StoreBizTypeParams.SERVICE,
            CommissionSourceParams.MANAGER,
            tx
          )
          // 4.4 更新流水状态为结算
          await this.commissionRuleRepo.updateCommissionRecordByStatus(
            order.id,
            'PENDING',
            tx
          )
          console.log('计算佣金', commissionList)
        }

        // 5.记录结算表
        const totalAmount = Number(order.actualPayment)
        const totalCommission = commissionList.reduce((sum, i) => sum + i.amount, 0) || 0
        // 5.1 获取抽成比例
        const rate = await this.commissionRuleRepo.findAll()
        const platformRate = rate[0].platformRate.toFixed(2)
        const platformFee = totalAmount * Number(platformRate)
        const managerIncome = totalAmount - totalCommission - platformFee
        // 5.2 计算结算表
        const settlement = await this.settlementRecordRepo.create({
          storeId: order.storeId,
          managerId: manager.id,

          orderId: order.id,
          orderAmount: totalAmount.toFixed(2),

          platformRate: (platformFee / totalAmount).toFixed(2),
          platformFee: platformFee.toFixed(2),

          managerIncome: managerIncome.toFixed(2),

          totalCommission: totalCommission.toFixed(2),

          status: SettlementStatusDto.SETTLED,
        }, tx)

        // 6.钱包记录
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
          remark: '贴膜收入'
        }
        await this.wallettransactionRepo.create(data, tx)
        // 6.3 更新上级余额
        const commissions = await this.commissionRuleRepo.findCommissionRecord(order.id, tx)
        if (totalCommission > 0) {
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
          // 更新佣金流水为已结算
          await this.commissionRuleRepo.updateCommissionRecordByStatus(
            order.id,
            'SETTLED',
            tx
          )
        }
      })
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

    return { return_code: 'SUCCESS', return_msg: 'OK' }
  }

  // 微信退款回调
  async wxRefund(data: any) {
    const key = process.env.API_V3_KEY
    // console.log('key', key)
    if (!key) throw new Error('API_V3_KEY 未配置')
    // 获取回调参数
    const { associated_data, ciphertext, nonce } = data.resource
    // 调用解密函数
    const decryptedData = decryptWechatData(key, associated_data, ciphertext, nonce)
    console.log('解密', decryptedData)
    const outTradeNo = decryptedData.out_trade_no

    // 查询订单 幂等校验
    const order = await this.OrderRepo.findOne(outTradeNo)
    console.log('订单状态', order?.status)

    if (order?.status === 'REFUNDED') {
      return { return_code: 'SUCCESS', return_msg: 'OK' }
    }

    // 如果回调结果为 SUCCESS 说明退款已成功，则同步更新订单状态
    if (decryptedData.refund_status === 'SUCCESS') {
      console.log('退款成功')
      let step = 'transaction'
      try {
        // 事务开始
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // 1.更新订单状态
          step = 'statusOrderUpdate'
          const refundOrder = await this.OrderRepo.statusOrderUpdate(outTradeNo, 'REFUNDED', undefined, tx)
          // console.log('更新结果', refundOrder)
          // 2.退还积分
          if (refundOrder.target !== 'TOB' && refundOrder.usedScore && refundOrder.usedScore > 0) {
            step = 'incScore'
            const updatedScoreByUser = await this.userRepo.updateUserIncScore(refundOrder.userId, refundOrder.usedScore, tx)
            // console.log('更新用户', updatedScoreByUser)

            step = 'pointsFlow'
            await this.pointsFlowRepo.create({
              userId: refundOrder.userId,
              type: 'INCOME',
              amount: refundOrder.usedScore,
              balance: updatedScoreByUser.score,
              source: '订单退款',
            }, tx)
            // console.log('积分流水', points)
          }

          // 3.门店流水冲正
          if (refundOrder.target === 'TOB') {
            step = 'storeTransaction'
            const user = await this.userRepo.findOne(refundOrder.userId)
            if (!user?.storeId) throw new BadRequestException('店长进货退款回调失败：当前用户未绑定门店')
            const dataDto = {
              storeId: user.storeId,
              consumerId: refundOrder.userId,
              type: ParamsStoreTransactionType.INCOME,
              bizType: ParamsStoreBizType.PURCHASE,
              amount: refundOrder.actualPayment.toString(),
              relatedOrderId: refundOrder.outTradeNo,
              remark: '订单退款'
            }
            const storeTransaction = await this.storeTransactionRepo.create(dataDto, tx)
            // console.log('门店流水', storeTransaction)
          }

          // 4.标记结算作废
          step = 'settlement'
          const settlement = await this.settlementRecordRepo.updateStatus(
            refundOrder.id,
            SettlementStatusDto.CANCELLED,
            tx
          )
          // console.log('门店结算', settlement)

          // 5.佣金流水标记为已取消
          step = 'commission'
          const commission = await this.commissionRuleRepo.updateCommissionRecordByStatus(refundOrder.id, 'CANCELLED', tx)
          // console.log('佣金标记', commission)

        })
      } catch (err) {
        console.error(`[wxRefund] step=${step}`, err)
        throw new BadRequestException('退款故障')
      }
    }
    return { return_code: 'SUCCESS', return_msg: 'OK' }
  }
}
