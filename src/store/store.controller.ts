import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SetManagerStore } from './dto/set-manager-store-dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  // 新增门店
  @Post('add')
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto)
  }

  // 获取所有门店
  @Get()
  async findAll(@Query() query: { pageNum: string, pageSize: string }) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.storeService.findAll(pageNum, pageSize)
  }

  // 获取门店会员用户
  @Get('vip/:inviterId')
  async storeByVip(@Param('inviterId') inviterId: string, @Query() query: { pageNum: string, pageSize: string }) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.storeService.storeByVip(inviterId, pageNum, pageSize)
  }

  // 获取门店详情
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id)
  }

  // 获取用户当前门店详情
  @Get('manager/:storeId')
  async managerFindOne(@Param('storeId') storeId: string, @Query('userId') userId: string) {
    return this.storeService.managerFindOne(storeId, userId)
  }

  // 更新门店基础信息
  @Patch('basicInfo/:id')
  async updateBasic(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.updateBasic(id, updateStoreDto)
  }

  // 设置店长
  @Patch('setManager/:id')
  async setManager(@Param('id') id: string, @Body() setManagerStore: SetManagerStore) {
    return this.storeService.setManager(id, setManagerStore)
  }

  // 解除店长
  @Patch('remove/:id')
  async removeManager(@Param('id') id: string, @Body() setManagerStore: SetManagerStore) {
    return this.storeService.removeManager(id, setManagerStore)
  }

  // 删除门店
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.storeService.remove(id)
  }


}
