import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { User } from '../models/user.model.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signSession } from '../utils/tokens.js';

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Enter a valid contact number.')
  .regex(/^[\d+][\d\s\-()]{6,}$/, 'Enter a valid contact number.');

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.'),
  birthdate: z
    .string()
    .min(1, 'Birthdate is required.')
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00`).getTime()), 'Enter a valid date.')
    .refine((v) => new Date(`${v}T00:00:00`).getTime() <= Date.now(), 'Birthdate cannot be in the future.'),
  sex: z.enum(['Female', 'Male', 'Other', 'Prefer not to say']),
  address: z.string().trim().min(1, 'Address is required.'),
  householdNumber: z.string().trim().min(1, 'Household number is required.'),
  contactNumber: phoneSchema,
  philHealthNumber: z.string().trim().optional().default(''),
  emergencyName: z.string().trim().min(1, 'Emergency contact name is required.'),
  emergencyNumber: phoneSchema,
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required to register.' }) }),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

function requireDB(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database is not connected. Try again later.' });
    return false;
  }
  return true;
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.fullName,
    email: user.email,
    role: user.role,
  };
}

export const register = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  const data = parsed.data;

  const existing = await User.findOne({ email: data.email }).lean();
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email is already registered.' });
  }

  // Public registration always creates a patient — role comes from the server, never the client.
  const user = await User.create({
    email: data.email,
    passwordHash: await hashPassword(data.password),
    role: 'patient',
    fullName: data.fullName,
    birthdate: new Date(`${data.birthdate}T00:00:00`),
    sex: data.sex,
    address: data.address,
    householdNumber: data.householdNumber,
    contactNumber: data.contactNumber,
    philHealthNumber: data.philHealthNumber ?? '',
    emergencyName: data.emergencyName,
    emergencyNumber: data.emergencyNumber,
  });

  res.status(201).json({ success: true, token: signSession(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    // Generic message on purpose — do not reveal whether the email exists.
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user || !user.active) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  res.json({ success: true, token: signSession(user), user: publicUser(user) });
});
