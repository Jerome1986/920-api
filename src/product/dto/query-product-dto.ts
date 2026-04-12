import { IsEnum, IsOptional, IsString } from "class-validator"
import { QueryTarget } from "src/category/dto/create-tcategory.dto"

export class QueryProductDto {
  @IsEnum(QueryTarget)
  target:QueryTarget
  
  @IsOptional()
  @IsString()
  pageNum:string 

  @IsOptional()
  @IsString()
  pageSize:string
}