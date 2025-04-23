import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  seen: { type: Boolean, default: false },
  notification_time: { type: Date, default: Date.now }
});

export default model('Notification', notificationSchema);
