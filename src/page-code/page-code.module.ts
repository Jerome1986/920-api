import { Module } from '@nestjs/common'
import { PageCodeController } from './page-code.controller'
import { PageCodeService } from './page-code.service'

@Module({
  controllers: [PageCodeController],
  providers: [PageCodeService],
})
export class PageCodeModule { }
