import { PartialType } from '@nestjs/mapped-types';
import { CreateTocOrderDto } from './create-toc-order.dto';

export class UpdateTocOrderDto extends PartialType(CreateTocOrderDto) {}
