import axios from "axios"

export interface PageCodeOptions {
  scene?: string
  page?: string
  width?: number
  checkPath?: boolean
}

let cachedToken: { token: string; expiresAt: number } = {
  token: '',
  expiresAt: 0,
}

const getAccessToken = async () => {
  const now = Date.now()
  if (cachedToken.token && cachedToken.expiresAt > now) {
    return cachedToken.token
  }

  const tokenRes = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: process.env.APPID,
      secret: process.env.APPSECRET,
    },
  })

  const accessToken = tokenRes.data?.access_token
  const expiresIn = tokenRes.data?.expires_in

  if (!accessToken || !expiresIn) {
    throw new Error(tokenRes.data?.errmsg || '获取 access_token 失败')
  }

  cachedToken = {
    token: accessToken,
    expiresAt: now + (expiresIn - 300) * 1000,
  }

  return accessToken
}

const parseWechatError = (data: ArrayBuffer) => {
  const text = Buffer.from(data).toString('utf8')
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// 获取一个扫码找膜页面的二维码
export const pageCodeGet = async (options: PageCodeOptions = {}): Promise<Buffer> => {
  const accessToken = await getAccessToken()

  const res = await axios.post(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
    {
      page: options.page ?? "pagesMember/userFindMo/userFindMo",
      scene: options.scene ?? "source=userFindMo",
      width: options.width ?? 430,
      check_path: false,  // options.checkPath ?? true
    },
    { responseType: 'arraybuffer' },
  )

  console.log('code', res)


  const contentType = res.headers?.['content-type']
  if (String(contentType)?.includes('application/json')) {
    const error = parseWechatError(res.data)
    throw new Error(error?.errmsg || '生成小程序二维码失败')
  }

  return Buffer.from(res.data, 'binary')
}
