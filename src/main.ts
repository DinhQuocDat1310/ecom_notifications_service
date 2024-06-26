import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RabbitMQService } from './libs/common/src';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Shopee_v2')
    .setContact('Shopee Admin', '', 'v02shopee@gmail.com')
    .setDescription('The Shopee V2 API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/notification', app, document);
  app.useGlobalPipes(new ValidationPipe());
  const rmqService = app.get<RabbitMQService>(RabbitMQService);
  app.connectMicroservice(rmqService.getOptions('NOTIFICATION'));
  app.enableCors({
    origin: 'http://localhost:3000',
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT);
}
bootstrap();
