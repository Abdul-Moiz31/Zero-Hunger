import { Request, Response } from 'express';
import Notification from '../models/Notification';

/**
 * Generic notification endpoints. The per-role routes (donor/ngo/volunteer)
 * cover the application's notification UX; these provide a shared, authenticated
 * fallback. Field names match the Notification schema (recipientId, taskId).
 */

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { recipientId, message, taskId } = req.body;

    if (!recipientId || !message) {
      return res
        .status(400)
        .json({ message: 'recipientId and message are required' });
    }

    const note = await Notification.create({ recipientId, message, taskId });
    return res.status(201).json(note);
  } catch (error) {
    console.error('sendNotification error:', error);
    return res.status(500).json({ message: 'Failed to create notification' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const notes = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};
