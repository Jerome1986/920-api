import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator"

export class CreateWalletWithdrawApplyDto {
  @IsString()
  @IsNotEmpty({ message: '缺少用户ID' })
  userId: string

  @IsNumber()
  @Min(100, { message: '提现金额必须大于等于100' })
  amount: number

  @IsString()
  @IsNotEmpty({ message: '缺少收款人姓名' })
  payeeName: string

  @IsString()
  @IsNotEmpty({ message: '缺少收款账号' })
  payeeAccount: string


  @IsString()
  @IsNotEmpty({ message: '请填写开户行' })
  bankName: string
}
