import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateStoreServiceOrderDto } from './dto/create-store-service-order.dto'
import { UpdateStoreServiceOrderDto } from './dto/update-store-service-order.dto'
import { StoreServiceOrderRepository } from './store-service-order.repository'
import { WechatSign } from "src/utils/wechat-sign"
import { getPrivateKey, nativeWechatOrder } from "src/utils/wechat-pay"
import QRCode from 'qrcode'
import { ServiceOrderStatus } from '@prisma/client'
import { FreeStoreServiceOrderDto } from './dto/free-store-service-order.dto'
import { UserRepository } from 'src/user/user.repository'
import { generateOrderNo } from 'src/utils/generateOrderNo'

@Injectable()
export class StoreServiceOrderService {
  constructor(
    private repo: StoreServiceOrderRepository,
    private userRepo: UserRepository
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
