import { useState, useEffect, useCallback } from 'react';
import { getSocket } from './socket';
import api from './api';

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
};

export function useNotifications(isAuthenticated: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load existing notifications on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          api.notifications.getAll(),
          api.notifications.getUnreadCount(),
        ]);
        setNotifications(notifRes.data);
        setUnreadCount(countRes.data.count);
      } catch { }
    };
    load();
  }, [isAuthenticated]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification', handleNotification);
    return () => { socket.off('notification', handleNotification); };
  }, [isAuthenticated]);

  const markAllRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { }
  }, []);

  const markOneRead = useCallback(async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { }
  }, []);

  return { notifications, unreadCount, markAllRead, markOneRead };
}