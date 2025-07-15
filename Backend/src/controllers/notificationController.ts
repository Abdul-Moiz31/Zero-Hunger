import { Request, Response } from 'express';
import Notification from '../models/Notification';
import transporter from '../config/nodemailer';

export const sendNotification = async (req: Request, res: Response) => {
  const { receiver_id, message, email } = req.body;
  const note = new Notification({ receiver_id, message });
  await note.save();

  if (email) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Notification from Zero Hunger',
      text: message
    });
  }

  res.status(201).json(note);
};

export const getNotifications = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const notes = await Notification.find({ receiver_id: req.user.id });
  res.json(notes);
};
