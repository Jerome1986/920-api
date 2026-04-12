import { } from "@prisma/client"
import { IsArray, IsOptional, IsString } from "class-validator"

export interface StockModelProductData {
  stockModelId: number
  categoryId: number
  productId: number
  skuId: number
  initStock: number
}

export class CreateStockModelDto {
  @IsString()
  name: string

  @IsOptional()
  @IsArray()
  items: StockModelProductData[]
}
