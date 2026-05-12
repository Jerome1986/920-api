import { Injectable } from '@nestjs/common'
import { DashboardRepository } from './dashboard.repository'

@Injectable()
export class DashboardService {
  constructor(private repo: DashboardRepository) { }

  // 获取平台统计汇总
  async summary() {
    const stats = await this.repo.summary()

    return {
      // 数据更新时间
      updatedAt: new Date().toISOString(),
      // 平台核心概览
      overview: {
        orderTotal: stats.orderTotal,
        productTotal: stats.productTotal,
        userTotal: stats.normalUserCount + stats.vipUserCount + stats.managerUserCount,
        storeTotal: stats.storeTotal,
        pendingSettlementAmount: stats.pendingSettlementAmount,
        applyingWithdrawCount: stats.applyingWithdrawCount,
      },
      // 商品中心统计
      goods: {
        tobProductCount: stats.tobProductCount,
        tocProductCount: stats.tocProductCount,
        vipPlanCount: stats.vipPlanCount,
        categoryCount: stats.categoryCount,
        stockTemplateCount: stats.stockTemplateCount,
        phoneModelCount: stats.phoneModelCount,
      },
      // 订单中心统计
      orders: {
        tocOrderCount: stats.tocOrderCount,
        managerOrderCount: stats.managerOrderCount,
        storeOrderCount: stats.storeServiceOrderCount,
        pendingCount: stats.pendingCount,
        paidCount: stats.paidCount,
        shippedCount: stats.shippedCount,
        completedCount: stats.completedCount,
        cancelledCount: stats.cancelledCount,
        processingCount: stats.processingCount,
        refundedCount: stats.refundedCount,
      },
      // 用户中心统计
      users: {
        normalUserCount: stats.normalUserCount,
        vipUserCount: stats.vipUserCount,
        managerUserCount: stats.managerUserCount,
        activeAccountCount: stats.activeAccountCount,
        inactiveAccountCount: stats.inactiveAccountCount,
      },
      // 门店中心统计
      stores: {
        storeCount: stats.storeTotal,
        boundManagerStoreCount: stats.boundManagerStoreCount,
        storeMemberCount: stats.storeMemberCount,
        pendingSettlementAmount: stats.pendingSettlementAmount,
      },
      // 财务中心统计
      finance: {
        settlementRecordCount: stats.settlementRecordCount,
        pendingSettlementCount: stats.pendingSettlementCount,
        settledCount: stats.settledCount,
        applyingWithdrawCount: stats.applyingWithdrawCount,
        paidWithdrawCount: stats.paidWithdrawCount,
        withdrawAmount: stats.withdrawAmount,
        platformFeeAmount: stats.platformFeeAmount,
        managerIncomeAmount: stats.managerIncomeAmount,
      },
    }
  }
}
