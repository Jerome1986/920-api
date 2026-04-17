import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

export enum ParamsStoreTransactionType {
  /// 收入（用户消费）
  INCOME = "INCOME",
  /// 支出（进货）
  EXPENSE = "EXPENSE"
}

/// 业务类型
export enum ParamsStoreBizType {
  /// 商品销售
  PRODUCT = "PRODUCT",
  /// 服务（如贴膜）
  SERVICE = "SERVICE",
  /// 进货
  PURCHASE = "PURCHASE"
}

export class CreateStoreTransactionDto {
  @IsString()
  @IsNotEmpty({ message: '缺少门店ID' })
  storeId: string

  @IsString()
  @IsOptional()
  operatorId?: string

  @IsString()
  @IsOptional()
  consumerId?: string

  @IsEnum(ParamsStoreTransactionType)
  type: ParamsStoreTransactionType

  @IsEnum(ParamsStoreBizType)
  bizType: ParamsStoreBizType

  @IsString()
  @IsNotEmpty({ message: '缺少变动金额' })
  amount: string

  @IsString()
  @IsOptional()
  relatedOrderId?: string

  @IsString()
  @IsOptional()
  relatedBizId?: string

  @IsString()
  @IsOptional()
  remark?: string
}