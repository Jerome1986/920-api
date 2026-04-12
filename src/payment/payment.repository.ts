import { BadRequestException, Injectable } from '@nestjs/common'
import { createWechatPay, getPrivateKey } from 'src/utils/wechat-pay'
import { WechatSign } from 'src/utils/wechat-sign'
import * as crypto from 'crypto'

@Injectable()
export class PaymentRepository {
  constructor() {}

  // 微信支付
  async wxPay(remark: string, outTradeNo: string, openid: string) {
    // 构建参数
    const body = {
      appid: process.env.APPID,
      mchid: process.env.MCH_ID,
      description: remark,
      out_trade_no: outTradeNo,
      notify_url: process.env.NOTIFY_URL,
      amount: {
        total: 1, // 单位分
        currency: 'CNY',
      },
      payer: {
        openid,
      },
    }

    // 调用微信支付签名工具类
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
      '/v3/pay/transactions/jsapi',
      body,
      timestamp,
      nonceStr,
    )

    try {
      // 调用微信支付接口
      const payRes = await createWechatPay(body, authorization)

      const prepay_id = payRes.data.prepay_id
      if (!prepay_id) {
        throw new BadRequestException('微信下单失败')
      }
      // 5. 返回给前端的参数-生成前端支付签名（JSAPI）
      return signer.signClient(process.env.APPID as string, timestamp, nonceStr, prepay_id)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
