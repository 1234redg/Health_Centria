import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'appointment-confirmed',
        'appointment-declined',
        'appointment-cancelled',
        'new-request',
        'new-announcement',
        'reminder',
      ],
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '', trim: true },
    link: { type: String, default: '' },
    // Optional dedupe key (e.g. one reminder per appointment per day).
    key: { type: String, index: true, sparse: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Notification =
  mongoose.models.Notification ?? mongoose.model('Notification', notificationSchema);
