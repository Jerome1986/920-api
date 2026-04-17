import { IsEnum, IsNotEmpty, IsString } from "class-validator"

export class UpdateOrderCompletedDto {
  @IsString()
  @IsNotEmpty({ message: '用户ID不可为空' })
  userId: string
}