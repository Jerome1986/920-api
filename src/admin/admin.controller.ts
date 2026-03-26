import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // 获取所有管理员
  @Get()
  findAll() {
    return this.adminService.findAll()
  }

  // 注册
  @Post('register')
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  // 登录
  @Post('login')
  login(@Body() dto: LoginAdminDto) {
    return this.adminService.login(dto)
  }

  // 删除指定管理员
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.del(id);
  }
}
