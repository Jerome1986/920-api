import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去除多余字段
      forbidNonWhitelisted: true, // 多字段直接报错
      transform: true // 全局转换dto的参数
    }),
  )
  // 统一返回
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();  
