import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ManagerLevel } from "./create-store.dto"

export class SetManagerStore {
  @IsString()
  @IsOptional()
  managerName: string

  @IsString()
  @IsOptional()
  managerPhone: string

  @IsEnum(ManagerLevel, {
    message: 'managerLevel 必须是 MANAGER_PRIMARY 或 MANAGER_SENIOR',
  })
  @IsOptional()
  managerLevel: ManagerLevel
}

export class RemoveManagerStore {
  @IsString()
  @IsNotEmpty({ message: '店长ID不能为空' })
  managerId: string
}
