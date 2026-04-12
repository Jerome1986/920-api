import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { TeamShowService } from './team-show.service'
import { CreateTeamShowDto } from './dto/create-team-show.dto'
import { UpdateTeamShowDto } from './dto/update-team-show.dto'

@Controller('team-show')
export class TeamShowController {
  constructor(private readonly teamShowService: TeamShowService) {}

  @Post('add')
  create(@Body() dto: CreateTeamShowDto) {
    return this.teamShowService.create(dto)
  }

  @Get()
  findAll() {
    return this.teamShowService.findAll()
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamShowDto) {
    console.log('update', dto)

    return this.teamShowService.update(+id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamShowService.remove(+id)
  }
}
