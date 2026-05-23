import { BadRequestException } from '@nestjs/common'

export function yuanToFen(amount: number | string | { toString(): string }) {
  const value = Number(amount)

  if (!Number.isFinite(value) || value <= 0) {
    throw new BadRequestException('支付金额错误')
  }

  return Math.round(value * 100)
}
