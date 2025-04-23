import User from '../models/User';
import { Request, Response } from 'express';

export const getVolunteers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: 'User information is missing.' });
    }
    const ngoId = req.user.id; 

    const volunteers = await User.find({
      ngoId,
      role: 'volunteer',
      isApproved: true,
    });

    res.status(200).json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch volunteers for NGO.' });
  }
};
