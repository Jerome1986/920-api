import { Injectable } from '@nestjs/common'
import { CreateBannerDto } from './dto/create-banner.dto'
import { UpdateBannerDto } from './dto/update-banner.dto'
import { BannerRepository } from './banner.repository'

@Injectable()
export class BannerService {
  constructor(private repo: BannerRepository) {}

  // 新增banner
  async create(dto: CreateBannerDto) {
    const banner = await this.repo.create(dto)
    return banner
  }

  async findAll() {
    return await this.repo.findAll()
  }

  findOne(id: number) {
    return `This action returns a #${id} banner`
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    return await this.repo.update(id, updateBannerDto)
  }

  async remove(id: number) {
    return await this.repo.remove(id)
  }
}
