import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator"

export enum ManagerLevel {
  MANAGER_PRIMARY = 'MANAGER_PRIMARY',
  MANAGER_SENIOR = 'MANAGER_SENIOR'
}

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

  @IsEnum(ManagerLevel)
  managerLevel: ManagerLevel

  @IsInt()
  @IsOptional()
  inventoryTemplateId: number
}
