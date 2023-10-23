import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NotificationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.rabbitmq', '.env'],
    }),
  ],
})
export class AppModule {}
