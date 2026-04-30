import prisma from '../config/prisma';
import { emitToUser } from '../socket';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'battle_challenge'
  | 'battle_accepted'
  | 'battle_result';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

// ─── Create + emit notification ───────────────────────────────────────────────
export const createNotification = async (input: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? {},
    },
  });

  // Emit to user in real-time via Socket.io
  emitToUser(input.userId, 'notification', notification);

  return notification;
};

// ─── Get user notifications ───────────────────────────────────────────────────
export const getUserNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
};

// ─── Mark as read ─────────────────────────────────────────────────────────────
export const markAsRead = async (userId: string, notificationId?: string) => {
  if (notificationId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
  // Mark all as read
  return prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });
};

// ─── Unread count ─────────────────────────────────────────────────────────────
export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};