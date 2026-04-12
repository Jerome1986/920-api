import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { VipExpireTask } from './user.task'
import { AuthRepository } from 'src/auth/auth.repository'

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, VipExpireTask, AuthRepository],
})
export class UserModule {}
