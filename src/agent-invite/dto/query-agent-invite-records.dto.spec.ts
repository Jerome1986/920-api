import 'reflect-metadata'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { AgentInviteBenefitStatus } from '@prisma/client'
import { QueryAgentInviteRecordsDto } from './query-agent-invite-records.dto'

describe('QueryAgentInviteRecordsDto', () => {
  it('接受 userId、手机号后四位、状态和分页参数', async () => {
    const dto = plainToInstance(QueryAgentInviteRecordsDto, {
      userId: 'user-1',
      mobile: '0800',
      benefitStatus: AgentInviteBenefitStatus.AVAILABLE,
      pageNum: '2',
      pageSize: '10',
    })

    expect(await validate(dto)).toHaveLength(0)
    expect(dto.pageNum).toBe(2)
    expect(dto.pageSize).toBe(10)
  })

  it('将空的可选筛选条件转换为未传', async () => {
    const dto = plainToInstance(QueryAgentInviteRecordsDto, {
      userId: 'user-1',
      mobile: ' ',
      benefitStatus: '',
    })

    expect(await validate(dto)).toHaveLength(0)
    expect(dto.mobile).toBeUndefined()
    expect(dto.benefitStatus).toBeUndefined()
  })

  it.each([
    [{}, 'userId'],
    [{ userId: '', mobile: '12345' }, 'mobile'],
    [{ userId: 'user-1', benefitStatus: 'INVALID' }, 'benefitStatus'],
    [{ userId: 'user-1', pageNum: '0' }, 'pageNum'],
    [{ userId: 'user-1', pageSize: '51' }, 'pageSize'],
  ])('拒绝非法参数 %p', async (input, property) => {
    const dto = plainToInstance(QueryAgentInviteRecordsDto, input)
    const errors = await validate(dto)

    expect(errors.some(error => error.property === property)).toBe(true)
  })
})
