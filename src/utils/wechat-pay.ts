import axios from 'axios'

// 请求微信V3支付
export async function createWechatPay(body, auth) {
  return axios.post(process.env.PAY_URL as string, body, { headers: { Authorization: auth }, proxy: false })
}

// 请求微信退款
export async function refundWxchatPay(body, auth) {
  return axios.post(process.env.REFUND_URL as string, body, {
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}

export function getPrivateKey() {
  return `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDemuFGGITdJnQF
3R9nYoIM3S2qY3Vspdvo/2/ePR8L4NBNeg64FN8/yPBoCdlPoX/Sa//QL2rG/W1X
QhaygB0cII7JnPwxdg9IhaAhwYXOlxEawsRKhQ87td20WMiWeh9SgW7fBtCCIcc4
OTf+cc6FLytLuwYbOpUEz90y+E1+Wt5ZXR7KnInC6vHRz+Z7ybJaCe50+JIS7DaV
Ye7XQD+11sqIEACgZn0NGep8QYTwmS5qU00cTaTqnWQSnEuoSJjRTatl5POKdTmI
4BITG+OUIpj8Hdt7EfTL/IQ840a4xOBTIyPVcIfZHBTj4mraG+7kkJZ+y8p5wUvq
zMV1LJNVAgMBAAECggEBAIcja2NMe0xujb0JkokG6oC4vYJVQvIkdq6qc9VtMa3a
W1rNoKXsNePZLulaIU0QdDLgUbqnLqGDNJ/mhTT0RbfPpB+NaCT20Sxrwtz7SSoz
17RxTQ0YXjkXnXJg+9UualmCLjbDQk3eB72ALxgPKxr7mcMt1PUuyUzUjCrnRtRP
YA5byKfFehUTIbFwxONLGoy4KIcVOde+pdhZ46m2NDUDImBujAUAJLzv0Dad+DwB
vGfKRmXjHgjTLPm17FJwuDTth33W0rlaXJz5Mu2obrefqVVmwXsWKyX5+3+OKnKI
8JE2X/dLewjzx6C0UrG02S4IFebVbh/VKzP7G8W1kHkCgYEA8qCWod5MV6kt6mQx
fji4DMxtRdfdDGC3g1jZoGkqLG8kZbhZxqOiXXeLkmGD+8OXB8MwpeANrJbuoYbe
mIqvkMoXu8gmM0vyMO+BYuKbJL0+Muvgq9fCTaOiS0V5XyVYbB2C3nzxdut/71Id
geJys6XpJJIHyYNuJwodz3D4ClcCgYEA6t/IJ4c9kAOLcL5Ag5hTOjPO/lnRYPzo
B7oVJ+Pwo+1TsiSgnedtsqfDDCzsQdTBCC63mJo4qTjyPtciQbM65D3+vSLBaUMz
tdFtgodvo+4oGHUavk2RecFhqgJn5aQbCdw+76rB8YM0f1BK9LDVeATGVKe6g2SJ
xAGmw9/HHDMCgYEA7JbPi/Qa+XgNP/yHjo98WW6WN37xG/rLuBbRz+v8peuS0GXd
lSdHUmEaBpl0e/ITugwJyhYa/2sGMxgywwipfkSys/fN2EN8XV+PCX/yzPaESl9c
a/UukUq5HTEX00G1YWe9j3rCcrXdwN6Py3Gna6qjF3gWg9fXd9YTj46XMG0CgYB9
hE/DiAuHPc2z14hEiw/XJ76zwK4bJayeDHynz7FW+UpkBhzrpbTC59JdXFh5qcfq
poSpAanMDUmv+WouMCkFtne+/abcqPQmcyARxG0N7wTwZQyArJVUutqFbzm0yClG
8LOVguyYM2THsNINx76cn/iZXvVWqFDTNYq4XItcbwKBgH8cwanDOk+wqT1+v+GJ
HU8RXgFo6CZg9pIMRxhc9eEXptPrBSDz2ba+Ua09EXUeDYIOBSjXFslLiXyTAw52
w8aa4+urWwGI2PBybQa9r9pMEKNY6wlciE9GrMneXULkf4qhTtMgYGjd/ZdTlReq
qA0Qm6NAHFc6mVbxyhEwNUWp
-----END PRIVATE KEY-----`
}
