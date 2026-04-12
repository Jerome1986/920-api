/**
 * 生成唯一订单号
 * @param prefix 可选前缀，例如 "WX"、"ORDER"
 * @returns 订单号字符串
 */
export function generateOrderNo(prefix = ''): string {
  const date = new Date()
  const y = date.getFullYear().toString()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  const ss = date.getSeconds().toString().padStart(2, '0')

  const timestamp = y + m + d + hh + mm + ss
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')

  return prefix + timestamp + random
}
