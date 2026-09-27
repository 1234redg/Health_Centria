import { z } from 'zod';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Appointment } from '../models/appointment.model.js';
import { AuditLog } from '../models/audit-log.model.js';
import { notifyEmail, notifyUser } from '../utils/notifications.js';

const listQuery = z.object({
  status: z.enum(['pending', 'confirmed', 'declined', 'completed', 'cancelled']).optional(),
  serviceId: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const declineSchema = z.object({
  reason: z.string().trim().min(1, 'A reason is required to decline.').max(500),
});

const completeSchema = z.object({
  diagnosis: z.string().trim().max(1000).optional().default(''),
  prescription: z.string().trim().max(1000).optional().default(''),
  visitNotes: z.string().trim().max(2000).optional().default(''),
});

function requireDB(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database is not connected. Try again later.' });
    return false;
  }
  return true;
}

function present(a) {
  const obj = typeof a.toObject === 'function' ? a.toObject() : a;
  return {
    id: String(obj._id),
    patient:
      obj.patient && typeof obj.patient === 'object'
        ? { id: String(obj.patient._id), name: obj.patient.fullName, email: obj.patient.email }
        : obj.patient,
    service:
      obj.service && typeof obj.service === 'object'
        ? { id: String(obj.service._id), name: obj.service.name }
        : obj.service,
    day: obj.day,
    timePreference: obj.timePreference,
    notes: obj.notes,
    status: obj.status,
    declineReason: obj.declineReason,
    diagnosis: obj.diagnosis ?? '',
    prescription: obj.prescription ?? '',
    visitNotes: obj.visitNotes ?? '',
    createdAt: obj.createdAt,
  };
}

async function log(actor, action, appointment, detail = '') {
  await AuditLog.create({
    actor,
    action,
    appointment: appointment._id,
    patient: appointment.patient,
    detail,
  });
}

export const queueAppointments = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid filters.' });
  }
  const { status, serviceId, from, to } = parsed.data;
  const filter = {};
  if (status) filter.status = status;
  if (serviceId) filter.service = serviceId;
  if (from || to) {
    filter.day = {};
    if (from) filter.day.$gte = from;
    if (to) filter.day.$lte = to;
  }
  const appointments = await Appointment.find(filter)
    .populate('patient', 'fullName email')
    .populate('service', 'name')
    .sort({ day: 1, createdAt: 1 })
    .lean();
  res.json({ success: true, appointments: appointments.map(present) });
});

export const confirmAppointment = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
  if (appt.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending appointments can be confirmed.' });
  }
  appt.status = 'confirmed';
  await appt.save();
  await log(req.user.id, 'appointment.confirm', appt);
  await appt.populate([{ path: 'patient', select: 'fullName email' }, { path: 'service', select: 'name' }]);
  await notifyUser(appt.patient._id, {
    type: 'appointment-confirmed',
    title: `Confirmed: ${appt.service.name} on ${appt.day}`,
    body: 'Your appointment is confirmed. Please arrive on time and bring a valid ID.',
    link: '/app/appointments',
  }).catch(() => {});
  notifyEmail(
    appt.patient.email,
    `HealthCentria: appointment confirmed (${appt.service.name}, ${appt.day})`,
    `Good news — your ${appt.service.name} appointment on ${appt.day} is confirmed.\n\nPlease arrive on time and bring a valid ID.\n\n— HealthCentria Barangay Health Center`,
  ).catch(() => {});
  res.json({ success: true, appointment: present(appt) });
});

export const declineAppointment = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = declineSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: 'A reason is required to decline.', errors: parsed.error.flatten().fieldErrors });
  }
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
  if (appt.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending appointments can be declined.' });
  }
  appt.status = 'declined';
  appt.declineReason = parsed.data.reason;
  await appt.save();
  await log(req.user.id, 'appointment.decline', appt, parsed.data.reason);
  await appt.populate([{ path: 'patient', select: 'fullName email' }, { path: 'service', select: 'name' }]);
  await notifyUser(appt.patient._id, {
    type: 'appointment-declined',
    title: `Declined: ${appt.service.name} on ${appt.day}`,
    body: `Reason: ${parsed.data.reason}`,
    link: '/app/appointments',
  }).catch(() => {});
  notifyEmail(
    appt.patient.email,
    `HealthCentria: appointment update (${appt.service.name}, ${appt.day})`,
    `Your ${appt.service.name} appointment on ${appt.day} could not be confirmed.\n\nReason: ${parsed.data.reason}\n\nPlease book another date.\n\n— HealthCentria Barangay Health Center`,
  ).catch(() => {});
  res.json({ success: true, appointment: present(appt) });
});

export const completeAppointment = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = completeSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: 'Validation failed.', errors: parsed.error.flatten().fieldErrors });
  }
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
  if (appt.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: 'Only confirmed appointments can be completed.' });
  }
  appt.status = 'completed';
  appt.diagnosis = parsed.data.diagnosis;
  appt.prescription = parsed.data.prescription;
  appt.visitNotes = parsed.data.visitNotes;
  await appt.save();
  await log(req.user.id, 'appointment.complete', appt);
  if (parsed.data.diagnosis || parsed.data.prescription || parsed.data.visitNotes) {
    await log(req.user.id, 'record.update', appt, 'Clinical visit record written on completion.');
  }
  await appt.populate([{ path: 'patient', select: 'fullName email' }, { path: 'service', select: 'name' }]);
  res.json({ success: true, appointment: present(appt) });
});
