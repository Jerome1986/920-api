import { Injectable } from '@nestjs/common'
import { VipOrderRepository } from './vip-order.repository'
import { CreateVipOrderDto } from './dto/create-vip-order.dto'
import { PaymentRepository } from 'src/payment/payment.repository'
import { QueryVipOrderStatus } from './dto/query-vip-order-dto'

@Injectable()
export class VipOrderService {
  constructor(
    private vipOrderRepository: VipOrderRepository,
    private wxPayRepo: PaymentRepository,
  ) {}

  // 创建会员订单
  async create(createVipOrderDto: CreateVipOrderDto) {
    // 1.创建订单
    const vipOrder = await this.vipOrderRepository.create(createVipOrderDto)

    // 2.调用微信支付
    const payRes = await this.wxPayRepo.wxPay(
      vipOrder.remark as string,
      vipOrder.outTradeNo,
      vipOrder.openid,
    )

    return payRes
  }

  // 查询当前会员订单
  async findOneByUser(userId: string, status: QueryVipOrderStatus) {
    return this.vipOrderRepository.findOneByUser(userId, status)
  }

  // 获取所有会员订单
  async findAll(status: QueryVipOrderStatus, pageNum: number, pageSize: number) {
    const [list, total] = await this.vipOrderRepository.findAll(status, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 根据用户电话和业务订单号查找会员订单--后台管理
  async findSearchByOrder(
    searchVal: string,
    status: QueryVipOrderStatus,
    pageNum: number,
    pageSize: number,
  ) {
    const [list, total] = await this.vipOrderRepository.findSearchByOrder(
      searchVal,
      status,
      pageNum,
      pageSize,
    )
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }
}
