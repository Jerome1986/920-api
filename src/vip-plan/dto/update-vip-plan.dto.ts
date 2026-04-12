import { PartialType } from '@nestjs/mapped-types';
import { CreateVipPlanDto } from './create-vip-plan.dto';

export class UpdateVipPlanDto extends PartialType(CreateVipPlanDto) {}
