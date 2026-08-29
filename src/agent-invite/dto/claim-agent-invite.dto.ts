import { IsNotEmpty, IsString } from 'class-validator'

// 用户确认领取代理邀请权益的请求参数
export class ClaimAgentInviteDto {
  // 二维码 scene 中携带的代理邀请码
  @IsString({ message: '代理邀请码必须是字符串' })
  @IsNotEmpty({ message: '缺少代理邀请码' })
  agentCode: string

  // 当前联调用户 ID，后续接入鉴权后从 Token 中获取
  @IsString({ message: '用户ID必须是字符串' })
  @IsNotEmpty({ message: '缺少用户ID' })
  userId: string
}
