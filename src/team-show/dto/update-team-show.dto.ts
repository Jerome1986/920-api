import { PartialType } from '@nestjs/mapped-types'
import { CreateTeamShowDto } from './create-team-show.dto'
import { IsNotEmpty } from 'class-validator'

export class UpdateTeamShowDto extends PartialType(CreateTeamShowDto) {
  @IsNotEmpty({ message: '状态不可为空' })
  status: 'ACTIVE' | 'INACTIVE'
}
