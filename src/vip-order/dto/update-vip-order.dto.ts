import { PartialType } from '@nestjs/mapped-types';
import { CreateVipOrderDto } from './create-vip-order.dto';

export class UpdateVipOrderDto extends PartialType(CreateVipOrderDto) {}
