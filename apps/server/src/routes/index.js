import { Router } from 'express';
import { announcementRouter } from './announcement.routes.js';
import { appointmentRouter } from './appointment.routes.js';
import { notificationRouter } from './notification.routes.js';
import { authRouter } from './auth.routes.js';
import { healthRouter } from './health.routes.js';
import { serviceRouter } from './service.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/announcements', announcementRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/services', serviceRouter);
apiRouter.use('/appointments', appointmentRouter);
apiRouter.use('/health', healthRouter);
