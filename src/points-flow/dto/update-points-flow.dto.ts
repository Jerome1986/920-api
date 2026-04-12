import { PartialType } from '@nestjs/mapped-types';
import { CreatePointsFlowDto } from './create-points-flow.dto';

export class UpdatePointsFlowDto extends PartialType(CreatePointsFlowDto) {}
