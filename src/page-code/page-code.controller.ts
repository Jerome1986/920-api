import { Controller, Post } from '@nestjs/common'
import { PageCodeService } from './page-code.service'

@Controller('page-code')
export class PageCodeController {
  constructor(private readonly pageCodeService: PageCodeService) { }

  // 生成扫码找膜小程序码
  @Post('user-find-mo')
  async createUserFindMoCode() {
    return this.pageCodeService.createUserFindMoCode()
  }
}
