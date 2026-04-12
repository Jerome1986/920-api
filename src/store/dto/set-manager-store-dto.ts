import { IsOptional, IsString } from "class-validator"

export class SetManagerStore {
  @IsString()
  @IsOptional()
  managerId: string

  @IsString()
  @IsOptional()
  managerName: string

  @IsString()
  @IsOptional()
  managerPhone: string
}