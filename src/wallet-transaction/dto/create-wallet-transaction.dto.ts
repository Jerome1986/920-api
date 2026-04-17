import { IsEnum, IsIn, IsInt, IsOptional, IsString } from "class-validator"

// 钱包收支方向
export enum WalletTransactionTypeDto {
  IN = "IN",
  OUT = "OUT"
}

/// 钱包业务类型
export enum WalletBizTypeDto {
  // 结算收入
  SETTLEMENT = "SETTLEMENT",
  // 佣金收入/支出 
  COMMISSION = "COMMISSION",
  // 提现
  WITHDRAW = "WITHDRAW",
  // 退款
  REFUND = "REFUND",
  // 冲正（佣金回收）
  REVERSE = "REVERSE"
}



export class CreateWalletTransactionDto {
  @IsString()
  userId: string

  @IsEnum(WalletTransactionTypeDto)
  type: WalletTransactionTypeDto

  @IsEnum(WalletBizTypeDto)
  bizType: WalletBizTypeDto

  @IsInt()
  amount: number

  @IsInt()
  balanceAfter: number

  @IsInt()
  relatedId: number

  @IsOptional()
  @IsString()
  remark: string
}
