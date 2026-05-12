import { Type } from "class-transformer"
import { IsInt, IsOptional } from "class-validator"

export class ApproveWalletWithdrawApplyDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  reviewerId?: number
}
