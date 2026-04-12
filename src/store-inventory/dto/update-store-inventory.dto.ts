import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreInventoryDto } from './create-store-inventory.dto';

export class UpdateStoreInventoryDto extends PartialType(CreateStoreInventoryDto) {}
