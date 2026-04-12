import { IsEnum, IsString } from 'class-validator'

export enum PointsFlowTypeQuery {
  ALL = 'ALL',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class QueryPointsDto {
  @IsEnum(PointsFlowTypeQuery)
  tab: PointsFlowTypeQuery

  @IsString()
  pageNum: string

  @IsString()
  pageSize: string
}
