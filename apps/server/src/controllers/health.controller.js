import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.json({
    success: true,
    message: 'ok',
    uptime: process.uptime(),
    db: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});
