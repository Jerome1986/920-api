import { PartialType } from '@nestjs/mapped-types';
import { CreateJobApplyDto } from './create-job-apply.dto';

export class UpdateJobApplyDto extends PartialType(CreateJobApplyDto) {}
