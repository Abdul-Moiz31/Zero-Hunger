import User from '../models/User';
import { Request, Response } from 'express';


export const approveVolunteer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const volunteer = await User.findById(id);

    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    volunteer.isApproved = true;
    await volunteer.save();

    res.status(200).json({ message: 'Volunteer approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getPendingVolunteers = async (_req: Request, res: Response) => {
  try {
    const volunteers = await User.find({ role: 'volunteer', isApproved: false });
    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pending volunteers' });
  }
};

export const getVolunteersByNgo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const volunteers = await User.find({ role: 'volunteer', ngoId: id, isApproved: true });
    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching volunteers for NGO' });
  }
};
