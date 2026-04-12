import { PartialType } from '@nestjs/mapped-types';
import { CreateTocOrderAddressDto } from './create-toc-order-address.dto';

export class UpdateTocOrderAddressDto extends PartialType(CreateTocOrderAddressDto) {}
