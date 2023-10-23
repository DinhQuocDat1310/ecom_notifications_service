export class DynamicNotificationDTO {
  title: string;
  body: string;
}

export class Notifications {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  status: string;
  notificationTokenId: string;
}

export class NotificationToken {
  device_type: string;
  notificationToken: string;
  status: string;
  userId: string;
}
