import { db } from "@/lib/db";

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, isRead: false } });
}

export async function getNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  return db.notification.create({ data });
}
