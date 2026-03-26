import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) { }

  // 获取所有管理员
  async findAllAdmin() {
    return this.prisma.admin.findMany()
  }

  // 注册用户
  async createAdmin(username: string, password: string) {
    return this.prisma.admin.create({ data: { username, password, role: 'STAFF' } })
  }

  // 查询用户
  async adminFindOne(username: string) {
    return this.prisma.admin.findUnique({
      where: { username }
    })
  }

  // 删除管理员
  async adminDelOne(id: number) {
    return this.prisma.admin.delete({
      where: { id }
    })
  }
}