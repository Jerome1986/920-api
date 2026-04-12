import { IsString } from 'class-validator';
export class CreateCommissionRuleDto {
  @IsString()
  level1Rate: string

  @IsString()
  level2Rate

  @IsString()
  platformRate

  @IsString()
  totalRate
}
