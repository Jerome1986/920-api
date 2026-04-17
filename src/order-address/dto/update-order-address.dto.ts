import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderAddressDto } from './create-order-address.dto';

export class UpdateOrderAddressDto extends PartialType(CreateOrderAddressDto) { }
