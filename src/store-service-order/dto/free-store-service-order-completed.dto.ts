import { IsEnum, IsString } from "class-validator"

enum ServiceOrderStatusDto {
  PENDING = "PENDING",
  PAID = "PAID",
  IN_SERVICE = "IN_SERVICE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED"
}

export class FreeStoreServiceOrderCompeletedDto {
  @IsString()
  outTradeNo: string

  @IsEnum(ServiceOrderStatusDto)
  status: ServiceOrderStatusDto
}