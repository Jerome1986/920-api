import { Injectable, Delete } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStoreDto } from "./dto/create-store.dto";
import { Prisma } from "@prisma/client";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { SetManagerStore } from "./dto/set-manager-store-dto";

@Injectable()
export class StoreRepository {
  constructor(private prisma: PrismaService) { }

  // 新增门店
  create(createStoreDto: CreateStoreDto, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.create({ data: createStoreDto })
  }

  // 获取所有门店
  async findAll(pageNum: number, pageSize: number) {
    return await Promise.all([
      this.prisma.store.findMany({
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: {
          users: {
            where: { role: { not: 'MANAGER' } }
          },
          manager: true
        }
      }),
      this.prisma.store.count()
    ])
  }

  // 删除门店
  remove(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.delete({ where: { id } })
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
  findManager(managerId: string) {
    return this.prisma.store.findUnique({
      where: { managerId }
    })
  }

  // 设定店长
  setManager(storeId: string, managerId: string, managerName: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma
    return db.store.update({
      where: { id: storeId },
      data: {
        managerId,
        managerName
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
        managerName: null
      }
    })
  }
}