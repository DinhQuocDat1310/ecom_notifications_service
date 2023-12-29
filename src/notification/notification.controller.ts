import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RabbitMQService } from 'src/libs/common/src';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @MessagePattern('enable_notification')
  async enableNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    const user = await this.notificationService.enablePushNotification(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('disable_notification')
  async disableNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    const user = await this.notificationService.disablePushNotification(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('send_notification')
  async sendNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    const user = await this.notificationService.sendNotification(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('get_all_notification')
  async getAllNotification(@Payload() data: any, @Ctx() context: RmqContext) {
    const user = await this.notificationService.getAllNotifications(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('send_notification_to_another')
  async sendNotificationForAnother(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const user = await this.notificationService.sendNotificationForAnother(
      data,
    );
    this.rmqService.ack(context);
    return user;
  }
}
