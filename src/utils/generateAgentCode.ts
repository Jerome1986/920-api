import { randomInt } from 'node:crypto'

const AGENT_CODE_CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const DEFAULT_AGENT_CODE_LENGTH = 8
const MAX_AGENT_CODE_LENGTH = 16

/**
 * 生成代理邀请码。
 *
 * 默认生成 8 位大写字母和数字组合，并排除 0/O/1/I 等易混淆字符。
 * 此函数只负责生成随机值，调用方仍需处理数据库唯一索引冲突。
 */
export function generateAgentCode(length = DEFAULT_AGENT_CODE_LENGTH): string {
  if (!Number.isInteger(length) || length < 1 || length > MAX_AGENT_CODE_LENGTH) {
    throw new RangeError(`代理邀请码长度必须是 1-${MAX_AGENT_CODE_LENGTH} 之间的整数`)
  }

  return Array.from(
    { length },
    () => AGENT_CODE_CHARACTERS[randomInt(AGENT_CODE_CHARACTERS.length)],
  ).join('')
}
