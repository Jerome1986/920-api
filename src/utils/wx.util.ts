// utils/wx.util.ts
import axios from 'axios'
import * as crypto from 'crypto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class WxUtil {
  private appId = process.env.APPID
  private secret = process.env.APPSECRET

  async getSession(code: string) {
    const url = `https://api.weixin.qq.com/sns/jscode2session`

    const res = await axios.get(url, {
      params: {
        appid: this.appId,
        secret: this.secret,
        js_code: code,
        grant_type: 'authorization_code',
      },
      proxy: false,
    })

    return res.data
  }

  decryptPhone(encryptedData, iv, sessionKey) {
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(sessionKey, 'base64'),
      Buffer.from(iv, 'base64'),
    )

    decipher.setAutoPadding(true)

    let decoded = decipher.update(encryptedData, 'base64', 'utf8')
    decoded += decipher.final('utf8')

    const result = JSON.parse(decoded)

    return result.phoneNumber
  }
}
