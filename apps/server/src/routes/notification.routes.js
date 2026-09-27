import { Router } from 'express';
import { listNotifications, markAllRead, markRead } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, listNotifications);
notificationRouter.post('/read-all', requireAuth, markAllRead);
notificationRouter.patch('/:id/read', requireAuth, markRead);
