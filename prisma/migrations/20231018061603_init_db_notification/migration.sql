-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "notificationTokenId" TEXT NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationToken" (
    "id" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "notificationToken" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,

    CONSTRAINT "NotificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_notificationTokenId_key" ON "Notifications"("notificationTokenId");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_notificationTokenId_fkey" FOREIGN KEY ("notificationTokenId") REFERENCES "NotificationToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
