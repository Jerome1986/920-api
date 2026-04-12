import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  // ✅ 开启 CORS，解决所有跨域（最简单版）
  app.enableCors()
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      // 1. 只保留 DTO 中定义的参数，过滤非法参数
      whitelist: true,
      // 2. 遇到非法参数（如 _id）直接抛出 400 错误
      forbidNonWhitelisted: true,
      // 3. 必传参数缺失时，强制报错
      skipMissingProperties: false,
      // 4. 自动把前端传的字符串参数转为 DTO 定义的类型（如 string 转 number）
      transform: true,
    }),
  )

  // 统一返回（需注入 Reflector，供跳过包装的装饰器使用）
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
  app.useStaticAssets(join(__dirname, '..', 'upload'), {
    prefix: '/upload/',
  })

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}
bootstrap()
