import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model('Notification', notificationSchema);