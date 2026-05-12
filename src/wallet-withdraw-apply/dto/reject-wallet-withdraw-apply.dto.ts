import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString } from "class-validator"

export class RejectWalletWithdrawApplyDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  reviewerId?: number

  @IsOptional()
  @IsString()
  rejectReason?: string
}
