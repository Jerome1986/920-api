import { IsDecimal, IsEnum, IsString } from 'class-validator';

// 业务类型
export enum StoreBizTypeParams {
  // 商品销售
  PRODUCT = "PRODUCT",
  // 服务（如贴膜）
  SERVICE = "SERVICE",
  // 进货
  PURCHASE = "PURCHASE"
}

/// 佣金来源
export enum CommissionSourceParams {
  /// 平台承担
  PLATFORM = "PLATFORM",
  /// 店长承担
  MANAGER = "MANAGER"
}

// 佣金规则参数
export class CreateCommissionRuleDto {
  @IsString()
  level1Rate: string

  @IsString()
  level2Rate

  @IsString()
  platformRate

  @IsString()
  totalRate
}

// 佣金流水参数
export class CreateCommissionRecordDto {
  @IsString()
  userId: string
  @IsString()
  fromUserId: string

  @IsEnum(StoreBizTypeParams)
  type: StoreBizTypeParams

  @IsString()
  relatedId: string

  @IsString()
  amount: string

  @IsDecimal()
  rate: string

  @IsEnum(StoreBizTypeParams)
  commissionSource: CommissionSourceParams
}
