import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePhoneModelDto } from './dto/create-phone-model.dto'
import { UpdatePhoneModelDto } from './dto/update-phone-model.dto'

@Injectable()
export class PhoneModelRepository {
  constructor(private prisma: PrismaService) { }

  // 新增一条型号
  create(dto: CreatePhoneModelDto) {
    return this.prisma.phoneModel.create({ data: dto })
  }

  // 分页获取
  async findAll(pageNum: number, pageSize: number, keyWord: string) {
    let where: any = {}
    if (keyWord) where.name = { contains: keyWord }
    return await Promise.all([
      this.prisma.phoneModel.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.phoneModel.count(),
    ])
  }

  // 根据名字查找
  findName(name: string) {
    return this.prisma.phoneModel.findFirst({
      where: { name },
    })
  }


  // 更新型号
  update(id: number, dto: UpdatePhoneModelDto) {
    return this.prisma.phoneModel.update({
      where: { id },
      data: dto,
    })
  }

  // 删除型号
  remove(id: number) {
    return this.prisma.phoneModel.delete({ where: { id } })
  }
}
