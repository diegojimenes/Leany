import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const config = new DocumentBuilder()
      .setTitle('Leany API')
      .setDescription('API REST para gerenciamento de Treinadores, Times e Pokémon')
      .setVersion('1.0')
      .build();
    let document = SwaggerModule.createDocument(app, config);
    document = cleanupOpenApiDoc(document);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(3000);
}
bootstrap();
