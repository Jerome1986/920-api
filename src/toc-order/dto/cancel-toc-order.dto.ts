import { IsNumber } from 'class-validator'

export class CancelTocOrderDto {
  @IsNumber()
  actualPayment: number
}
