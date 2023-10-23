import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { RabbitMQModule, RabbitMQService } from 'src/libs/common/src';
import { ConfigService } from '@nestjs/config';
import { USER_SERVICE } from './constants/service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/service';

@Module({
  imports: [
    RabbitMQModule.register({
      name: USER_SERVICE,
    }),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    RabbitMQService,
    ConfigService,

    PrismaService,
  ],
})
export class NotificationModule {}
