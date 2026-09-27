import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from '../controllers/announcement.controller.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export const announcementRouter = Router();

// Public feed — no login needed.
announcementRouter.get('/', listAnnouncements);

// Any staff can post and edit; only admin can delete.
announcementRouter.post('/', requireAuth, requireRole('staff', 'admin'), createAnnouncement);
announcementRouter.patch('/:id', requireAuth, requireRole('staff', 'admin'), updateAnnouncement);
announcementRouter.delete('/:id', requireAuth, requireRole('admin'), deleteAnnouncement);
