import { IsDate, IsEnum, IsOptional, IsString } from "class-validator"

export enum SettlementStatusDto {
  /// 待结算（订单已支付，但未完成）
  PENDING = "PENDING",
  /// 已结算（已进入钱包）
  SETTLED = "SETTLED",
  /// 已取消（订单取消）
  CANCELLED = "CANCELLED",
  /// 已退款（已结算后冲正）
  REFUNDED = "REFUNDED"
}

export class CreateSettlementRecordDto {
  @IsString()
  storeId: string

  @IsString()
  managerId: string

  @IsString()
  orderId: string

  @IsString()
  orderAmount: string

  @IsString()
  platformRate: string

  @IsString()
  platformFee: string

  @IsString()
  managerIncome: string

  @IsEnum(SettlementStatusDto)
  status: SettlementStatusDto

  @IsOptional()
  @IsDate()
  settledAt?: Date
}
