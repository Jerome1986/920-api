import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTeamShowDto } from './dto/create-team-show.dto'
import { UpdateTeamShowDto } from './dto/update-team-show.dto'

@Injectable()
export class TeamShowRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeamShowDto) {
    return await this.prisma.team.create({ data: dto })
  }

  async findAll() {
    return await this.prisma.team.findMany({ orderBy: { createdAt: 'asc' } })
  }

  async update(id: number, dto: UpdateTeamShowDto) {
    return await this.prisma.team.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: number) {
    return await this.prisma.team.delete({ where: { id } })
  }
}
