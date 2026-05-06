import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreRepository } from './store.repository';
import { UserRepository } from 'src/user/user.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StockModelRepository } from 'src/stock-model/stock-model.repositroy';
import { StoreInventoryRepositroy } from 'src/store-inventory/store-inventory.repository';
import { Decimal } from '@prisma/client/runtime/client';
import { SetManagerStore } from './dto/set-manager-store-dto';
import { WalletRepository } from 'src/wallet/wallet.repository';
import { TimeRangePreset } from 'src/store-transaction/dto/query-store-transaction.dto';
import { OrderRepository } from 'src/order/order.repository';

@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private storeRepo: StoreRepository,
    private userRepo: UserRepository,
    private storeStockModelRepo: StockModelRepository,
    private storeInventoryRepo: StoreInventoryRepositroy,
    private walletRepo: WalletRepository,
    private orderRepo: OrderRepository
  ) { }

  // 新增门店
  async create(createStoreDto: CreateStoreDto) {
    try {
      const reuslt = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.验证店长是否注册
        const user = await this.userRepo.findOne(createStoreDto.managerId, tx)
        if (!user) throw new BadRequestException('请店长先注册平台')

        // 2.创建门店基础信息
        const store = await this.storeRepo.create(createStoreDto, tx)
        if (!store) throw new BadRequestException('门店创建失败')

        // 3.更新用户身份为店长
        const manager = await this.userRepo.updateUserByManager(user.id, store.id, 'MANAGER', tx)
        if (!manager) throw new BadRequestException('店长创建失败')

        // 4.初始化库存
        if (createStoreDto.inventoryTemplateId) {
          // 4.1 获取对应的库存模版
          const stockModel = await this.storeStockModelRepo.findSku(createStoreDto.inventoryTemplateId, tx)
          if (!stockModel) throw new BadRequestException('没有找到对应库存模版')

          // 4.2 准备参数
          const storeInventoryData = stockModel?.items.map(item => ({
            storeId: store.id,
            categoryId: item.categoryId,
            skuId: item.skus.id,
            stock: item.initStock ?? 0,
            costPrice: String(item.skus.costPrice),
            salePrice: String(item.skus.salePrice)
          }))
          // 4.3 将套餐里的SKU添加至门店库存
          if (storeInventoryData?.length) {
            const storeInventory = await this.storeInventoryRepo.createMany(storeInventoryData, tx)
            if (!storeInventory) throw new BadRequestException('门店库存创建失败')
          }
        }

        // 5.初始化门店钱包
        const wallet = await this.walletRepo.createByUserWallet(user.id, tx)
        if (!wallet) throw new BadRequestException('门店钱包创建失败')

        return store.id
      })

      // 返回格式
      return {
        storeId: reuslt
      }
    } catch (err) {
      // console.error('createStore', err)
      //  Prisma 外键错误，变成 400
      if (err.code === 'P2003') {
        throw new BadRequestException('创建失败：关联数据不存在')
      }
      throw err
    }
  }

  // 获取门店会员用户
  async storeByVip(inviterId: string, pageNum: number, pageSize: number) {
    console.log(inviterId)

    if (!inviterId) throw new BadRequestException('用户ID不存在')
    const [list, total] = await this.userRepo.storeByVip(inviterId, pageNum, pageSize)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 获取所有门店
  async findAll(pageNum: number, pageSize: number) {
    // 1.获取门店信息
    const [stores, total] = await this.storeRepo.findAll(pageNum, pageSize)
    const managerIds = stores.map(l => l.managerId) as string[]
    // 2.查询店长钱包
    const wallets = await this.walletRepo.findByUserWallet(managerIds)

    // 3.做一个MAP 性能优化
    const walletMap = new Map()
    wallets.forEach(w => {
      walletMap.set(w.userId, w)
    })

    // 4.合并数据
    const list = stores.map(store => ({
      ...store,
      wallet: walletMap.get(store.managerId) || {
        balance: 0,
        availableBalance: 0,
        frozenBalance: 0
      }
    }))

    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    }
  }

  // 获取指定门店经营概览
  async storeDashboard(storeId: string, userId: string, timeRangePreset: TimeRangePreset) {
    // 1.获取门店所有的服务订单
    const serviceOrder = await this.orderRepo.findStoreOrder(storeId, timeRangePreset, 'COMPLETED')
    // 2.获取门店进货单
    const tobOrder = await this.orderRepo.findTobOrder(userId, timeRangePreset, 'COMPLETED')
    // 3.计算汇总
    // 3.1 营业额
    const turnoverAmount = serviceOrder.reduce((sum, service) => sum + Number(service.actualPayment), 0).toFixed(2)
    // 3.2 服务数
    const serviceCount = serviceOrder.length
    // 3.3 客单价
    const avgCustomerPrice = serviceCount > 0 ? (Number(turnoverAmount) / serviceCount).toFixed(2) : 0
    // 3.4 进货支出
    const purchaseExpense = tobOrder.reduce((sum, tob) => sum + Number(tob.actualPayment), 0).toFixed(2)
    // 3.5 利润
    const profitAmount = (Number(turnoverAmount) - Number(purchaseExpense)).toFixed(2)

    return {
      // 营业额
      turnoverAmount,
      // 服务订单数
      serviceCount,
      // 客单价
      avgCustomerPrice,
      // 进货支出
      purchaseExpense,
      // 利润
      profitAmount
    }
  }

  // 门店详情
  async findOne(id: string) {
    // 1. 获取原始数据
    const store = await this.storeRepo.findOne(id)

    // 2. 空值判断
    if (!store) {
      throw new BadRequestException('门店不存在')
    }

    // 3. 重构 inventory 数据
    const newInventory = store.inventory.map(item => {
      // 先把 sku 抽出来，剩下的叫 rest
      const { sku, ...rest } = item
      const attrs = sku.attrs as {
        label: string,
        value: string
      }

      return {
        ...rest,         // 所有原来的字段
        skuValue: attrs.value,
        productName: item.sku.product.name
      }
    })

    // 4. 返回一个新对象，覆盖 inventory
    return {
      ...store,
      inventory: newInventory
    }
  }

  // 获取用户（店长）当前门店信息
  async managerFindOne(storeId: string, userId: string) {
    // 1.获取店长对应的门店
    const store = await this.storeRepo.managerFindOne(storeId, userId)
    if (!store) throw new BadRequestException('门店不存在')
    // 2.获取门店钱包
    const wallet = await this.walletRepo.findOne(userId)
    if (!wallet) throw new BadRequestException('门店钱包错误')
    const data = {
      ...store,
      wallet
    }
    return data
  }

  // 更新门店基础信息
  async updateBasic(id: string, updateStoreDto: UpdateStoreDto) {
    return this.storeRepo.updateBasic(id, updateStoreDto)
  }

  // 设定店长
  async setManager(storeId: string, setManagerStore: SetManagerStore) {
    return this.prisma.$transaction(async (tx) => {
      const { managerName, managerPhone } = setManagerStore

      // 1. 检查门店是否存在 & 是否已有店长
      const store = await this.storeRepo.findOne(storeId, tx)
      if (!store) {
        throw new BadRequestException('门店不存在')
      }
      if (store.managerId) {
        throw new BadRequestException('该门店已拥有店长，无法设置')
      }

      // 2. 检查用户是否存在 & 是否已经是店长
      const user = await this.userRepo.userFindByPhone(managerPhone, tx)
      if (!user) {
        throw new BadRequestException('用户未注册')
      }
      if (user.role === 'MANAGER') {
        throw new BadRequestException('该用户已是店长，不能重复担任')
      }

      // 3. 升级用户为店长
      await this.userRepo.updateUserByManager(user.id, store.id, 'MANAGER', tx)

      // 4. 绑定店长到门店
      const updatedStore = await this.storeRepo.setManager(
        store.id,
        user.id,
        managerName,
        tx
      )

      return updatedStore
    })
  }


  // 解除店长
  async removeManager(id: string, setManagerStore: SetManagerStore) {
    const { managerId } = setManagerStore
    return this.prisma.$transaction(async (tx) => {
      // 1.旧店长 → 降级为普通用户
      await this.userRepo.updateUserByManager(managerId, id, 'USER', tx)
      // 2.门店解除店长关系
      return this.storeRepo.removeManager(id, tx)
    })
  }

  // 删除门店
  async remove(id: string) {
    try {
      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1.删除当前门店
        const store = await this.storeRepo.remove(id, tx)
        // 2.将店长身份更新至用户
        if (store.managerId) {
          await this.userRepo.updateUserByManager(store.managerId, null, 'USER', tx)
          // 3.删除门店钱包
          await this.walletRepo.deleteByUserWallet(store.managerId)
        }

        return {
          storeId: store.id
        }
      })

      return result
    } catch (err) {
      throw new BadRequestException('删除门店失败')
    }
  }
}
