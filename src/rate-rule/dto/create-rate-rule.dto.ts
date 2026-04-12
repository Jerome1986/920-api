import { IsNumber, Max, Min } from 'class-validator'

export class CreateRateRuleDto {
  /**
   * 返积分比例：0 ~ 1 之间
   * 例如 0.1 = 10%
   */
  @IsNumber({}, { message: '返积分比例必须是数字' })
  @Min(0, { message: '返积分比例不能小于 0' })
  @Max(1, { message: '返积分比例不能大于 1' })
  earnRate: number

  /**
   * 积分抵扣换算率：默认 1
   */
  @IsNumber({}, { message: '积分抵扣换算率必须是数字' })
  @Min(0, { message: '积分抵扣换算率不能小于 0' })
  useRate: number

  /**
   * 订单最大积分抵扣比例：0~1
   * 例如 0.1 = 10%
   */
  @IsNumber({}, { message: '订单最大积分抵扣比例必须是数字' })
  @Min(0, { message: '订单最大积分抵扣比例不能小于 0' })
  @Max(1, { message: '订单最大积分抵扣比例不能大于 1' })
  maxUsePercent: number
}
