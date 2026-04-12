import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserAvatarDto } from './dto/update-avatar.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { userRole } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 获取所有用户信息
  @Get()
  async findAll(@Query() query: { pageNum: number; pageSize: number, role?: userRole }) {
    const pageNum = Number(query.pageNum)
    const pageSize = Number(query.pageSize)
    return this.userService.findAll(pageNum, pageSize, query.role)
  }

  // 搜索用户（手机号/邀请码）
  @Get('search')
  async searchUser(@Query() query: { searchVal: string, pageNum: string, pageSize: string, role?: userRole }) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.userService.searchUser(query.searchVal, pageNum, pageSize, query.role)
  }

  // 获取用户详情
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
  }


  // 更新头像
  @Patch('avatar/:id')
  async updateAvatar(@Param('id') id: string, @Body() updateUserAvatarDto: UpdateUserAvatarDto) {
    return this.userService.updateAvatar(id, updateUserAvatarDto)
  }

  // 更新用户信息
  @Patch(':userId')
  async updateUserInfo(@Param('userId') userId: string, @Body() updateUserInfo: UpdateUserDto) {
    return this.userService.updateUserInfo(userId, updateUserInfo)
  }

  // 删除指定用户
  @Delete('delete/:userId')
  async deleteUser(@Param('userId') userId: string) {
    const user = await this.userService.deleteUser(userId)
    return {
      id: user.id
    }
  }

  // 获取下级用户
  @Get('friend/:userId')
  async findChildUser(
    @Param('userId') userId: string,
    @Query() query: { pageNum: string; pageSize: string },
  ) {
    const pageNum = Number(query.pageNum) || 1
    const pageSize = Number(query.pageSize) || 10
    return this.userService.findChildUser(userId, pageNum, pageSize)
  }

  // 获取用户的上级
  @Get('parent/:referralCode')
  async findParentUser(@Param('referralCode') referralCode: string) {
    return this.userService.findParentUser(referralCode)
  }

  // 生成自己的好友邀请码
  @Get('friendCode/:referralCode')
  async friendCode(@Param('referralCode') referralCode: string) {
    return this.userService.friendCode(referralCode)
  }
}
