import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  foodId: Types.ObjectId;
  threadId: string; // `${foodId}-${Math.min(senderId,receiverId)}-${Math.max(...)}`
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    foodId:     { type: Schema.Types.ObjectId, ref: 'Food', required: true, index: true },
    threadId:   { type: String, required: true, index: true },
    senderId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content:    { type: String, required: true, maxlength: 1000 },
    read:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ threadId: 1, createdAt: 1 });

export default model<IMessage>('Message', messageSchema);
