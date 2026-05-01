import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common'
import { CreatePhoneModelDto } from './dto/create-phone-model.dto'
import { UpdatePhoneModelDto } from './dto/update-phone-model.dto'
import { PhoneModelRepository } from './phone-model.repository'
import { getMarketingName } from '@customerio/devices'
import { parseAppleModel } from 'src/utils/parseAppleModel'

@Injectable()
export class PhoneModelService {
  constructor(private repo: PhoneModelRepository) { }

  //新增型号
  async create(dto: CreatePhoneModelDto) {
    // 查看是否有重复的型号
    const check = await this.repo.findName(dto.name)
    if (check) {
      throw new BadRequestException('请勿重复添加')
    }

    // 插入数据库
    const model = await this.repo.create(dto)
    return {
      id: model.id,
    }
  }

  // 识别设备型号--使用@customerio/devices库来识别
  deviceInfo(model: string) {
    console.log('型号', model)

    if (!model) throw new BadRequestException('参数错误')

    let phoneName = '未知设备'
    if (model.includes('iPhone')) {
      const { deviceCode, displayFallback } = parseAppleModel(model)

      if (deviceCode) {
        phoneName = getMarketingName(deviceCode) || displayFallback
        console.log('苹果识别1', phoneName)
      } else {
        phoneName = displayFallback
        console.log('苹果识别2', phoneName)
      }

    } else if (model.includes('HUAWEI')) {
      const newModel = model.replace('HUAWEI', '华为')
      phoneName = newModel
    } else {
      // 安卓：直接用原始 model
      phoneName = getMarketingName(model) ?? '未知设备'
      console.log('安卓识别', phoneName)
    }

    return {
      phoneName
    }
  }


  // 查询所有型号
  async findAll(pageNum: number, pageSize: number, keyWord: string) {
    const [list, total] = await this.repo.findAll(pageNum, pageSize, keyWord)
    return {
      list,
      total,
      pageNum,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    }
  }

  // 更新型号
  async update(id: number, dto: UpdatePhoneModelDto) {
    if (!id) throw new BadRequestException('参数错误')
    return await this.repo.update(id, dto)
  }

  // 删除型号
  async remove(id: number) {
    if (!id) throw new BadRequestException('参数错误')
    return await this.repo.remove(id)
  }
}
