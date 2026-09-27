import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Appointment } from '../models/appointment.model.js';
import { User } from '../models/user.model.js';
import { addDaysYMD, todayYMD } from '../utils/service-schedule.js';

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(30),
});

function requireDB(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database is not connected. Try again later.' });
    return false;
  }
  return true;
}

// Visits per service over the last N days (completed appointments only, v1).
export const visitsPerService = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid range.' });
  }
  const { days } = parsed.data;
  const today = todayYMD();
  const from = addDaysYMD(today, -(days - 1));
  const rows = await Appointment.aggregate([
    { $match: { status: 'completed', day: { $gte: from, $lte: today } } },
    { $group: { _id: '$service', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'service',
      },
    },
    { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        serviceId: { $toString: '$_id' },
        serviceName: { $ifNull: ['$service.name', 'Service'] },
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  res.json({ success: true, from, to: today, days, total, rows });
});

// Daily-ops + system counts for the admin dashboard (staff see shared counts;
// staff-account count is admin-only).
export const overview = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const today = todayYMD();
  const [todayCount, pendingCount, totalPatients] = await Promise.all([
    Appointment.countDocuments({ day: today, status: { $in: ['confirmed', 'pending'] } }),
    Appointment.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'patient' }),
  ]);
  const out = { success: true, today: todayCount, pending: pendingCount, totalPatients };
  if (req.user.role === 'admin') {
    out.activeStaff = await User.countDocuments({ role: 'staff', active: true });
  }
  res.json(out);
});
