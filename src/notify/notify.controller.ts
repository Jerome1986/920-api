import { Controller, Post, Body, Res } from '@nestjs/common'
import { NotifyService } from './notify.service'

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) { }

  // 支付回调
  @Post()
  async create(@Body() data: any, @Res() res) {
    await this.notifyService.wxNotify(data)
    res.status(200).json({ return_code: 'SUCCESS', return_msg: 'OK' })
  }

  // 退款回调
  @Post('refund')
  async refund(@Body() data: any, @Res() res) {
    await this.notifyService.wxRefund(data)
    res.status(200).json({ return_code: 'SUCCESS', return_msg: 'OK' })
  }
}
