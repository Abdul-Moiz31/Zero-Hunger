import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Message from '../models/Message';
import Food from '../models/Food';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import { getIO } from '../config/socket';

const buildThreadId = (foodId: string, a: string, b: string) => {
  const sorted = [a, b].sort();
  return `${foodId}::${sorted[0]}::${sorted[1]}`;
};

/** GET /api/messages/:foodId?peerId=xxx */
export const getThread = asyncHandler(async (req: Request, res: Response) => {
  const { foodId } = req.params;
  const { peerId } = req.query as { peerId?: string };
  if (!peerId) throw new AppError('peerId query param required', 400);

  const myId = req.user!.id;
  const threadId = buildThreadId(foodId, myId, peerId);

  const messages = await Message.find({ threadId })
    .populate('senderId', 'name role')
    .populate('receiverId', 'name role')
    .sort({ createdAt: 1 });

  await Message.updateMany(
    { threadId, receiverId: new Types.ObjectId(myId), read: false },
    { $set: { read: true } }
  );

  res.json(messages);
});

/** POST /api/messages/:foodId */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { foodId } = req.params;
  const { receiverId, content } = req.body;

  if (!receiverId || !content?.trim())
    throw new AppError('receiverId and content are required', 400);

  const food = await Food.findById(foodId);
  if (!food) throw new AppError('Food listing not found', 404);

  const myId = req.user!.id;
  const threadId = buildThreadId(foodId, myId, receiverId);

  const msg = await Message.create({
    foodId,
    threadId,
    senderId: new Types.ObjectId(myId),
    receiverId: new Types.ObjectId(receiverId),
    content: content.trim(),
  });

  const populated = await msg.populate([
    { path: 'senderId', select: 'name role' },
    { path: 'receiverId', select: 'name role' },
  ]);

  const io = getIO();
  if (io) io.to(receiverId).emit('new_message', populated);

  res.status(201).json(populated);
});

/** GET /api/messages/inbox */
export const getInbox = asyncHandler(async (req: Request, res: Response) => {
  const userObjId = new Types.ObjectId(req.user!.id);

  const threads = await Message.aggregate([
    { $match: { $or: [{ senderId: userObjId }, { receiverId: userObjId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$threadId',
        last: { $first: '$$ROOT' },
        unread: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userObjId] }, { $eq: ['$read', false] }] },
              1, 0,
            ],
          },
        },
      },
    },
    { $sort: { 'last.createdAt': -1 } },
    { $limit: 50 },
  ]);

  // Populate message fields
  const lastMessages = await Message.populate(threads.map((t) => t.last), [
    { path: 'senderId', select: 'name role organization_name' },
    { path: 'receiverId', select: 'name role organization_name' },
    { path: 'foodId', select: 'title' },
  ]);

  res.json(threads.map((t, i) => ({ ...t, last: lastMessages[i] })));
});
