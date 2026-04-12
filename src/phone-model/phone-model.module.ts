import { Module } from '@nestjs/common'
import { PhoneModelService } from './phone-model.service'
import { PhoneModelController } from './phone-model.controller'
import { PhoneModelRepository } from './phone-model.repository'

@Module({
  controllers: [PhoneModelController],
  providers: [PhoneModelService, PhoneModelRepository],
})
export class PhoneModelModule {}
