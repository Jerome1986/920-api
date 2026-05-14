import { Injectable } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStoreDto } from "./dto/create-store.dto";
import { Prisma, userRole } from "@prisma/client";
import { UpdateStoreDto } from "./dto/update-store.dto";

@Injectable()
export class StoreRepository {
  constructor(private prisma: PrismaService) { }

  // 新增门店
  create(createStoreDto: CreateStoreDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    const {
      managerId,
      name,
      address,
      phone,
      managerName,
      managerLevel,
      inventoryTemplateId
    } = createStoreDto

    return db.store.create({
      data: {
        name,
        address,
        phone,
        managerId,
        managerName,
        managerLevel,
        inventoryTemplateId
      }
    })
  }


  // 获取所有门店
  async findAll(pageNum: number, pageSize: number) {
    const where = { status: 'ACTIVE' as const }

    return await Promise.all([
      this.prisma.store.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: {
          users: {
            where: { role: { notIn: ['MANAGER_PRIMARY', 'MANAGER_SENIOR'] } }
          },
          manager: true
        }
      }),
      this.prisma.store.count({ where })
    ])
  }

  // 删除门店
  remove(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.delete({ where: { id } })
  }

  // 禁用门店（业务删除）
  disableStore(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        managerId: null,
        managerName: null,
        managerLevel: null
      }
    })
  }

  // 门店详情
  findOne(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { sku: { include: { product: true } } }
        },
        users: {
          where: {
            role: 'VIP'
          }
        },
        inventoryModel: true,
        manager: true
      }
    })
  }

  // 获取用户（店长）当前门店信息
  managerFindOne(storeId: string, userId: string) {
    return this.prisma.store.findUnique({
      where: { id: storeId, managerId: userId }
    })
  }

  // 更新门店基础信息
  updateBasic(id: string, updateStoreDto: UpdateStoreDto) {
    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto
    })
  }

  // 查询该门店是否有店长
  findManager(managerId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.findUnique({
      where: { managerId }
    })
  }

  // 设定店长
  setManager(storeId: string, managerId: string, managerName: string, managerLevel: userRole, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.update({
      where: { id: storeId },
      data: {
        managerId,
        managerName,
        managerLevel
      }
    })
  }

  // 解除店长
  removeManager(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.update({
      where: { id },
      data: {
        managerId: null,
        managerName: null,
        managerLevel: null
      }
    })
  }
}
