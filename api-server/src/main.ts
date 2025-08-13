import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestInterceptor } from './common/interceptors/request.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  app.useGlobalInterceptors(new RequestInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SkinTorch API')
    .setDescription('SkinTorch API 문서')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      // HTTP 환경에서 HTTPS 리소스 로딩 방지
      url: '/api/docs-json',
      validatorUrl: null,
    },
    // 커스텀 설정으로 HTTP 강제
    customSiteTitle: 'SkinTorch API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    // HTTP 리소스 경로 강제 설정
    customJs: [
      'http://34.22.87.94:3000/api/docs/swagger-ui-bundle.js',
      'http://34.22.87.94:3000/api/docs/swagger-ui-standalone-preset.js'
    ],
    customCssUrl: [
      'http://34.22.87.94:3000/api/docs/swagger-ui.css'
    ],
  });
  const port = parseInt(config.get<string>('PORT', '3000'), 10);
  await app.listen(port);
}
bootstrap();
