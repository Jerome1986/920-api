import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: '门店名称不可以为空' })
  name: string

  @IsString()
  @IsNotEmpty({ message: '门店地址不可以为空' })
  address: string

  @IsString()
  @IsNotEmpty({ message: '门店电话不可以为空' })
  phone: string

  @IsString()
  @IsOptional()
  managerId: string

  @IsString()
  @IsOptional()
  managerName: string

  @IsInt()
  @IsOptional()
  inventoryTemplateId: number
}
