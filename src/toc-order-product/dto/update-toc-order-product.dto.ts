import { PartialType } from '@nestjs/mapped-types';
import { CreateTocOrderProductDto } from './create-toc-order-product.dto';

export class UpdateTocOrderProductDto extends PartialType(CreateTocOrderProductDto) {}
