import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateStoreInventoryDto {
  @IsString()
  @IsNotEmpty()
  storeId: string

  @IsInt()
  skuId: number

  @IsInt()
  categoryId: number

  @IsInt()
  @IsOptional()
  stock: number

  @IsString()
  @IsOptional()
  costPrice?: string

  @IsString()
  @IsOptional()
  salePrice?: string
}
