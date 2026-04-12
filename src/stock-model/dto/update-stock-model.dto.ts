import { PartialType } from '@nestjs/mapped-types';
import { CreateStockModelDto } from './create-stock-model.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStockModelDto extends PartialType(CreateStockModelDto) {
  
}
