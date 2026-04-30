import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreServiceOrderDto } from './create-store-service-order.dto';

export class UpdateStoreServiceOrderDto extends PartialType(CreateStoreServiceOrderDto) {}
