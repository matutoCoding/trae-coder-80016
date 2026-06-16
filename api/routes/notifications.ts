import { Router, Request, Response } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../services/notificationService.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { unread } = req.query;
  const notifications = getNotifications(unread === 'true');
  res.json({ notifications });
});

router.get('/unread-count', (req: Request, res: Response) => {
  const count = getUnreadCount();
  res.json({ count });
});

router.put('/:id/read', (req: Request, res: Response) => {
  const notification = markAsRead(req.params.id);
  if (!notification) {
    return res.status(404).json({ error: '通知不存在' });
  }
  res.json({ notification });
});

router.put('/read-all', (req: Request, res: Response) => {
  const count = markAllAsRead();
  res.json({ success: true, count });
});

export default router;
