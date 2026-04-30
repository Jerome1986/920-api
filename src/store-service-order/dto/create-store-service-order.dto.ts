import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateStoreServiceOrderDto {
  @IsString()
  @IsNotEmpty()
  storeId: string

  @IsInt()
  @IsNotEmpty()
  productId: number

  @IsString()
  @IsOptional()
  productName: string

  @IsString()
  @IsOptional()
  productCover: string

  @IsInt()
  @IsNotEmpty()
  skuId: number

  @IsString()
  @IsNotEmpty()
  skuNo: string

  @IsString()
  @IsNotEmpty()
  originalPrice: string

  @IsString()
  @IsNotEmpty()
  actualPayment: string
}
