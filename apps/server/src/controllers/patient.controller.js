import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Appointment } from '../models/appointment.model.js';
import { User } from '../models/user.model.js';

const listQuery = z.object({
  search: z.string().trim().max(100).optional().default(''),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

function requireDB(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database is not connected. Try again later.' });
    return false;
  }
  return true;
}

function presentList(u) {
  return {
    id: String(u._id),
    name: u.fullName,
    email: u.email,
    contactNumber: u.contactNumber ?? '',
    householdNumber: u.householdNumber ?? '',
    active: u.active,
    createdAt: u.createdAt,
  };
}

export const listPatients = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid search.' });
  }
  const { search, limit } = parsed.data;
  const filter = { role: 'patient' };
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { contactNumber: rx }, { householdNumber: rx }];
  }
  const patients = await User.find(filter).sort({ fullName: 1 }).limit(limit).lean();
  res.json({ success: true, patients: patients.map(presentList) });
});

function presentVisit(a) {
  const obj = typeof a.toObject === 'function' ? a.toObject() : a;
  return {
    id: String(obj._id),
    service:
      obj.service && typeof obj.service === 'object'
        ? { id: String(obj.service._id), name: obj.service.name }
        : obj.service,
    day: obj.day,
    status: obj.status,
    diagnosis: obj.diagnosis ?? '',
    prescription: obj.prescription ?? '',
    visitNotes: obj.visitNotes ?? '',
    createdAt: obj.createdAt,
  };
}

export const getPatient = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }
  const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).lean();
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }
  const visits = await Appointment.find({ patient: patient._id })
    .populate('service', 'name')
    .sort({ day: -1, createdAt: -1 })
    .lean();
  res.json({
    success: true,
    patient: {
      id: String(patient._id),
      name: patient.fullName,
      email: patient.email,
      birthdate: patient.birthdate,
      sex: patient.sex,
      address: patient.address,
      householdNumber: patient.householdNumber,
      contactNumber: patient.contactNumber,
      philHealthNumber: patient.philHealthNumber ?? '',
      emergencyName: patient.emergencyName,
      emergencyNumber: patient.emergencyNumber,
      active: patient.active,
      createdAt: patient.createdAt,
    },
    visits: visits.map(presentVisit),
  });
});
