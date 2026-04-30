import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createNotification, getUserNotifications, markAsRead, getUnreadCount } from '../services/notification.service';
import { sendSuccess } from '../utils/response';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await getUserNotifications(req.user!.userId);
    return sendSuccess(res, notifications, 'Notifications fetched');
  } catch (err) { return next(err); }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user!.userId);
    return sendSuccess(res, { count }, 'Unread count');
  } catch (err) { return next(err); }
});

router.patch('/read', async (req, res, next) => {
  try {
    await markAsRead(req.user!.userId);
    return sendSuccess(res, null, 'Marked all as read');
  } catch (err) { return next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await markAsRead(req.user!.userId, req.params.id);
    return sendSuccess(res, null, 'Marked as read');
  } catch (err) { return next(err); }
});

export default router;