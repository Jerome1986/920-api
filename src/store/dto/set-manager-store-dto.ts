import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { ManagerLevel } from "./create-store.dto"

export class SetManagerStore {
  @IsString()
  @IsNotEmpty({ message: '店长姓名不能为空' })
  managerName: string

  @IsString()
  @IsNotEmpty({ message: '店长手机号不能为空' })
  managerPhone: string

  @IsEnum(ManagerLevel, {
    message: 'managerLevel 必须是 MANAGER_PRIMARY 或 MANAGER_SENIOR',
  })
  @IsNotEmpty({ message: '店长等级不能为空' })
  managerLevel: ManagerLevel
}

export class RemoveManagerStore {
  @IsString()
  @IsNotEmpty({ message: '店长ID不能为空' })
  managerId: string
}
