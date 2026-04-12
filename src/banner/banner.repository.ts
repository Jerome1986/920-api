import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateBannerDto } from './dto/create-banner.dto'
import { UpdateBannerDto } from './dto/update-banner.dto'

@Injectable()
export class BannerRepository {
  constructor(private prisma: PrismaService) {}

  // 新增
  async create(dto: CreateBannerDto) {
    return await this.prisma.banner.create({ data: dto })
  }

  async findAll() {
    return await this.prisma.banner.findMany({ orderBy: { sort: 'asc' } })
  }

  findOne(id: number) {
    return `This action returns a #${id} banner`
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    return await this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    })
  }

  async remove(id: number) {
    await this.prisma.banner.delete({ where: { id } })
    return {
      acknowledged: true,
    }
  }
}
