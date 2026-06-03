import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { emitNotification } from '../utils/notify';

/**
 * Generic, authenticated notification endpoints. Per-role routes
 * (donor/ngo/volunteer) cover the app's notification UX; these provide a
 * shared fallback. `sendNotification` is admin-only (see route).
 */

export const sendNotification = asyncHandler(async (req: Request, res: Response) => {
  const { recipientId, message, taskId } = req.body;
  const note = await emitNotification({ recipientId, message, taskId });
  res.status(201).json(note);
});

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError('User not authenticated', 401);
  const notes = await Notification.find({ recipientId: req.user.id })
    .populate('taskId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json(notes);
});
