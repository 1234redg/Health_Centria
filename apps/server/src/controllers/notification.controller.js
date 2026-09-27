import mongoose from 'mongoose';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Notification } from '../models/notification.model.js';

function requireDB(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database is not connected. Try again later.' });
    return false;
  }
  return true;
}

function present(n) {
  return {
    id: String(n._id),
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt,
  };
}

export const listNotifications = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const items = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  const unread = await Notification.countDocuments({ recipient: req.user.id, read: false });
  res.json({ success: true, unread, notifications: items.map(present) });
});

export const markRead = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { read: true },
    { new: true },
  );
  if (!item) return res.status(404).json({ success: false, message: 'Notification not found.' });
  res.json({ success: true, notification: present(item.toObject()) });
});

export const markAllRead = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
  res.json({ success: true });
});
