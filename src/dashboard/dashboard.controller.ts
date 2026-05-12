import { Controller, Get } from '@nestjs/common'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  // 获取平台统计汇总
  @Get('summary')
  async summary() {
    return this.dashboardService.summary()
  }
}
