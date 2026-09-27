import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signSession(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifySession(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
