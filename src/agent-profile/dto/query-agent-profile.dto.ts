import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export enum QueryAgentStatus {
  // 全部代理状态
  ALL = 'ALL',
  // 已启用
  ACTIVE = 'ACTIVE',
  // 已停用
  DISABLED = 'DISABLED',
}

// 后台代理列表查询参数
export class QueryAgentProfileDto {
  // 当前页码，业务层默认为 1
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  pageNum?: number

  // 每页条数，业务层默认为 10，最大为 100
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数不能小于1' })
  @Max(100, { message: '每页条数不能超过100' })
  pageSize?: number

  // 代理状态，未传时默认查询全部
  @IsOptional()
  @IsEnum(QueryAgentStatus, { message: '代理状态错误' })
  status?: QueryAgentStatus

  // 搜索关键词，用于匹配用户和代理相关信息
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  keyword?: string

  // 代理开通开始时间，要求为 ISO 8601 日期字符串
  @IsOptional()
  @IsDateString({}, { message: '开通开始时间格式错误' })
  openedStartAt?: string

  // 代理开通结束时间，要求为 ISO 8601 日期字符串
  @IsOptional()
  @IsDateString({}, { message: '开通结束时间格式错误' })
  openedEndAt?: string
}
