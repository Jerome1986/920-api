import { IsString } from 'class-validator'

export class ModelListDto {
  @IsString()
  searchVal: string
}
