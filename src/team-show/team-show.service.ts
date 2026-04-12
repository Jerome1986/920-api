import { Injectable } from '@nestjs/common'
import { CreateTeamShowDto } from './dto/create-team-show.dto'
import { UpdateTeamShowDto } from './dto/update-team-show.dto'
import { TeamShowRepository } from './team-show.repository'

@Injectable()
export class TeamShowService {
  constructor(private repo: TeamShowRepository) {}

  async create(dto: CreateTeamShowDto) {
    const team = await await this.repo.create(dto)
    return {
      insertedId: team.id,
    }
  }

  async findAll() {
    return await this.repo.findAll()
  }

  async update(id: number, dto: UpdateTeamShowDto) {
    return await this.repo.update(id, dto)
  }

  async remove(id: number) {
    await this.repo.remove(id)
    return {
      acknowledged: true,
    }
  }
}
