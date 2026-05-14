import { Module } from '@nestjs/common'
import { QuickSellController } from './quick-sell.controller'
import { QuickSellRepository } from './quick-sell.repository'
import { QuickSellService } from './quick-sell.service'

@Module({
  controllers: [QuickSellController],
  providers: [QuickSellService, QuickSellRepository],
})
export class QuickSellModule {}
