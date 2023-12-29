import {
  Injectable,
  Inject,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import {
  NOTIFICATION_LOGIN_DIFF_DEVICE,
  NOTIFICATION_NEW_MESSAGE,
  NOTIFICATION_UPDATED_USER,
  SERVICE_ACCOUNT_NAME,
  USER_SERVICE,
} from './constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/service';
import { Notifications } from './dto/notification';
import { Status } from '@prisma/client';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', SERVICE_ACCOUNT_NAME),
  ),
});

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

  enablePushNotification = async (data: any): Promise<any> => {
    //Inactive all existing notifications of a user
    try {
      await this.prismaService.notificationToken.updateMany({
        where: {
          userId: data.user.id,
        },
        data: {
          status: Status.INACTIVE,
        },
      });
      const notify = await this.prismaService.notificationToken.create({
        data: {
          userId: data.user.id,
          device_type: data.notificationDTO.device_type,
          notificationToken: data.notificationDTO.notificationToken,
          status: Status.ACTIVE,
        },
      });
      if (notify) {
        return {
          status: HttpStatus.OK,
          message: 'Turn on notification successfully',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  disablePushNotification = async (data: any): Promise<any> => {
    try {
      const notify = await this.prismaService.notificationToken.updateMany({
        where: {
          userId: data.user.id,
          device_type: data.notificationDTO.device_type,
        },
        data: {
          status: Status.INACTIVE,
        },
      });
      if (notify) {
        return {
          status: HttpStatus.OK,
          message: 'Turn off notification successfully',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getAllNotifications = async (data: any): Promise<any> => {
    try {
      return await this.prismaService.notifications.findMany({
        where: {
          notificationsToken: {
            userId: data.id,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  sendNotification = async (user: any): Promise<void> => {
    try {
      //Send notification to current user
      const notificationToken =
        await this.prismaService.notificationToken.findFirst({
          where: {
            userId: user.id,
            status: Status.ACTIVE,
          },
        });
      if (notificationToken) {
        const data = {
          title: 'Default new notification',
          body: 'Default new notification send successfully',
          status: Status.ACTIVE,
          createdBy: user.username,
          notificationsToken: {
            connect: {
              id: notificationToken.id,
            },
          },
        };
        switch (user.notify_type) {
          case NOTIFICATION_UPDATED_USER:
            data['title'] = 'Updated your profile';
            data['body'] = "We noticed you've updated your profile";
            break;
          case NOTIFICATION_LOGIN_DIFF_DEVICE:
            data['title'] = 'Login difference device';
            data['body'] =
              "We noticed you're having unusual logins on another device. If not, please protect your account here.";
            break;
          default:
            break;
        }
        const notify: Notifications =
          await this.prismaService.notifications.create({
            data,
          });

        await firebase
          .messaging()
          .send({
            notification: { title: notify.title, body: notify.body },
            token: notificationToken.notificationToken,
          })
          .catch((error) => {
            throw new InternalServerErrorException(error.message);
          });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  sendNotificationForAnother = async (user: any): Promise<void> => {
    try {
      const memberInConversation = user['members'].filter(
        (member: any) => member.userId !== user.id,
      );

      const notificationToken = await Promise.all(
        memberInConversation.map(async (user: any) => {
          return await this.prismaService.notificationToken.findMany({
            where: {
              userId: user.userId,
              status: Status.ACTIVE,
            },
          });
        }),
      );
      const arrayNotification = notificationToken[0];
      if (arrayNotification.length > 0) {
        for (let index = 0; index < arrayNotification.length; index++) {
          const data = {
            title: 'Default new notification',
            body: 'Default new notification send successfully',
            status: Status.ACTIVE,
            createdBy: user.username,
            notificationsToken: {
              connect: {
                id: arrayNotification[index].id,
              },
            },
          };
          switch (user.notify_type) {
            case NOTIFICATION_NEW_MESSAGE:
              data['title'] = user.username;
              data['body'] = user.messages.message;
              break;
            default:
              break;
          }
          const notify: Notifications =
            await this.prismaService.notifications.create({
              data,
            });

          await firebase
            .messaging()
            .send({
              notification: { title: notify.title, body: notify.body },
              token: arrayNotification[index].notificationToken,
            })
            .catch((error) => {
              throw new InternalServerErrorException(error.message);
            });
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
}
