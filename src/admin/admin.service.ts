import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminRepository } from './admin.repository';
import * as bcrypt from 'bcrypt'
import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AdminService {
  constructor(
    private adminRepo: AdminRepository,
    private jwtService: JwtService
  ) { }

  // 获取所有管理员
  async findAll() {
    const admin = await this.adminRepo.findAllAdmin()
    return admin
  }

  // 注册
  async create(dto: CreateAdminDto) {
    const checkOne = await this.adminRepo.adminFindOne(dto.username)
    if (checkOne) {
      throw new BadGatewayException('用户名已存在')
    }
    // 加密密码
    const hashPassword = await bcrypt.hash(dto.password, 10)
    const admin = await this.adminRepo.createAdmin(
      dto.username,
      hashPassword,
    )

    return {
      id: admin.id,
      username: admin.username,
      status: admin.status,
      createdAt: admin.createdAt
    }
  }

  // 删除管理员用户
  async del(id: number) {
    // 如果当前数据库只有一个管理员则不可删除
    const check = await this.adminRepo.findAllAdmin()
    if (check.length === 1) {
      throw new BadRequestException('不可删除唯一的管理员')
    }

    const admin = await this.adminRepo.adminDelOne(id)
    return {
      id: admin.id
    }
  }

  // 登录
  async login(dto: LoginAdminDto) {
    const { username, password } = dto

    //1.查用户
    const admin = await this.adminRepo.adminFindOne(username)

    if (!admin) {
      throw new BadRequestException('账号不存在')
    }

    //2.校验密码
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      throw new BadRequestException('密码错误')
    }

    //3.生成 token
    const token = this.jwtService.sign({
      userId: admin.id,
      username: admin.username,
      role: admin.role
    })

    // 3️⃣ 返回数据
    return {
      token,
      userInfo: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    }
  }
}
