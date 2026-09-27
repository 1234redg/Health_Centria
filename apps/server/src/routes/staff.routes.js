import { Router } from 'express';
import { createStaff, listStaff, updateStaff } from '../controllers/staff.controller.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export const staffRouter = Router();

staffRouter.use(requireAuth, requireRole('admin'));
staffRouter.get('/', listStaff);
staffRouter.post('/', createStaff);
staffRouter.patch('/:id', updateStaff);
