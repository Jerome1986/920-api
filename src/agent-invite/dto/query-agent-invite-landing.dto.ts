import { IsNotEmpty, IsString } from 'class-validator'

// 查询代理邀请领取页状态的请求参数
export class QueryAgentInviteLandingDto {
  // 当前联调用户 ID，后续接入鉴权后从 Token 中获取
  @IsString({ message: '用户ID必须是字符串' })
  @IsNotEmpty({ message: '缺少用户ID' })
  userId: string
}
