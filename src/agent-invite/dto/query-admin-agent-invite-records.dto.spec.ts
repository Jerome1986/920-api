import 'reflect-metadata'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { QueryAdminAgentInviteRecordsDto } from './query-admin-agent-invite-records.dto'

describe('QueryAdminAgentInviteRecordsDto', () => {
  it('接受后台支持的分页数量', async () => {
    for (const pageSize of ['10', '20', '50']) {
      const dto = plainToInstance(QueryAdminAgentInviteRecordsDto, {
        userId: 'user-1',
        pageSize,
      })
      expect(await validate(dto)).toHaveLength(0)
    }
  })

  it('缺少代理用户ID时返回约定的校验消息', async () => {
    const dto = plainToInstance(QueryAdminAgentInviteRecordsDto, {})
    const errors = await validate(dto)

    expect(errors[0].constraints).toMatchObject({ isNotEmpty: '缺少代理用户ID' })
  })

  it('拒绝超过50的分页数量', async () => {
    const dto = plainToInstance(QueryAdminAgentInviteRecordsDto, {
      userId: 'user-1',
      pageSize: '51',
    })
    const errors = await validate(dto)

    expect(errors.find(error => error.property === 'pageSize')?.constraints).toMatchObject({
      max: 'pageSize不能大于50',
    })
  })
})
