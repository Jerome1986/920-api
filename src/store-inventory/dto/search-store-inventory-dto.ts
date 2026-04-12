import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class SearchStoreInventoryDto {
  @IsString()
  @IsNotEmpty()
  storeId: string

  @IsString()
  keyword: string

  @IsInt()
  categoryId: number
}