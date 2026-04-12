import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateTocOrderDto } from './dto/create-toc-order.dto'
import { UpdateTocOrderDto } from './dto/update-toc-order.dto'
import { TocOrderRepository } from './toc-order.repository'
import { TocOrderProductRepository } from 'src/toc-order-product/toc-order-product.repository'
import { CreateTocOrderProductDto } from 'src/toc-order-product/dto/create-toc-order-product.dto'
import { TocOrderAddressRepository } from 'src/toc-order-address/toc-order-address.repository'
import { PrismaService } from 'src/prisma/prisma.service'
import { OrderStatus, Prisma } from '@prisma/client'
import { PaymentRepository } from 'src/payment/payment.repository'
import { OrderQueryStatus } from './dto/query-toc-order.dto'
import { generateOrderNo } from 'src/utils/generateOrderNo'
import { CancelTocOrderDto } from './dto/cancel-toc-order.dto'
import { WechatSign } from 'src/utils/wechat-sign'
import { getPrivateKey, refundWxchatPay } from 'src/utils/wechat-pay'
import * as crypto from 'crypto'

@Injectable()
export class TocOrderService {
  constructor(
    private prisma: PrismaService,
    private repo: TocOrderRepository,
    private orderProducntRepo: TocOrderProductRepository,
    private orderAddressRepo: TocOrderAddressRepository,
    private wxPayRepo: PaymentRepository,
  ) {}

  // c端商品订单创建-支付订单
  async create(orderDto: CreateTocOrderDto) {
    const { products, addressInfo } = orderDto
    try {
      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.创建订单
        const order = await this.repo.create(orderDto, tx)
        // 2.创建订单商品
        await this.orderProducntRepo.createManyProducts(
          order.id,
          products as CreateTocOrderProductDto[],
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
  async findAll(status: OrderQueryStatus, pageNum: number, pageSize: number) {
    const [list, total] = await this.repo.findAll(status, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 获取指定用户所有订单
  async findUserOrder(userId: string, status: OrderQueryStatus, pageNum: number, pageSize: number) {
    const [list, total] = await this.repo.findUserOrder(userId, status, pageNum, pageSize)
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
    return this.repo.statusOrderUpdate(outTradeNo, status)
  }

  // 获取订单详情
  async findOne(outTradeNo: string) {
    return this.repo.findOne(outTradeNo)
  }

  // 取消订单
  async cancelOrder(outTradeNo: string, CancelTocOrderDto: CancelTocOrderDto) {
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
      await this.repo.statusOrderUpdate(outTradeNo, 'CANCELLED')
    }

    return {
      code: 200,
      message: '退款申请已提交',
      data: resp.data,
    }
  }
}
