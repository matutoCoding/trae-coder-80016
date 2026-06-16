import { Notification } from '../../shared/types.js';
import { readData, writeData, generateId } from '../utils/storage.js';
import { DataFiles } from '../data/mockData.js';

export function getNotifications(unreadOnly?: boolean): Notification[] {
  let notifications = readData<Notification[]>(DataFiles.NOTIFICATIONS, []);
  
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }
  
  return notifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addNotification(data: {
  type: Notification['type'];
  title: string;
  message: string;
}): Notification {
  const notifications = readData<Notification[]>(DataFiles.NOTIFICATIONS, []);
  
  const newNotification: Notification = {
    id: generateId(),
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(newNotification);
  
  if (notifications.length > 100) {
    notifications.length = 100;
  }
  
  writeData(DataFiles.NOTIFICATIONS, notifications);
  return newNotification;
}

export function markAsRead(notificationId: string): Notification | null {
  const notifications = readData<Notification[]>(DataFiles.NOTIFICATIONS, []);
  const notification = notifications.find(n => n.id === notificationId);
  
  if (!notification) return null;
  
  notification.read = true;
  writeData(DataFiles.NOTIFICATIONS, notifications);
  return notification;
}

export function markAllAsRead(): number {
  const notifications = readData<Notification[]>(DataFiles.NOTIFICATIONS, []);
  let count = 0;
  
  for (const n of notifications) {
    if (!n.read) {
      n.read = true;
      count++;
    }
  }
  
  writeData(DataFiles.NOTIFICATIONS, notifications);
  return count;
}

export function getUnreadCount(): number {
  const notifications = readData<Notification[]>(DataFiles.NOTIFICATIONS, []);
  return notifications.filter(n => !n.read).length;
}
