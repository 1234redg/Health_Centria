import { Router } from 'express';
import { getPatient, listPatients } from '../controllers/patient.controller.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

export const patientRouter = Router();

patientRouter.get('/', requireAuth, requireRole('staff', 'admin'), listPatients);
patientRouter.get('/:id', requireAuth, requireRole('staff', 'admin'), getPatient);
