import { Request, Response } from 'express';
import Food from '../models/Food';

// If req.user is used, define a custom type for it
interface AuthRequest extends Request {
  user?: { id: string };
}

export const addFood = async (req: AuthRequest, res: Response) => {
  const food = new Food({ ...req.body, userId: req.user?.id });
  await food.save();
  res.status(201).json(food);
};

// Alternative implementation with even more precise filtering
export const getAvailableFoods = async (_req: Request, res: Response) => {
  try {
    // Find foods that are available and either have no ngoId field or it's null/undefined
    const foods = await Food.find({
      status: 'available',
      $or: [
        { ngoId: { $exists: false } },  // ngoId field doesn't exist
        { ngoId: null }                 // ngoId is null
      ]
    }).populate('donorId', 'name'); // Optionally populate donor information
    
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error fetching available foods:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available foods', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const acceptFood = async (req: AuthRequest, res: Response) => {
  const food = await Food.findByIdAndUpdate(req.params.id, {
    ngoId: req.user?.id,
    status: 'assigned',
    acceptance_time: new Date()
  }, { new: true });
  res.json(food);
};

export const assignVolunteer = async (req: AuthRequest, res: Response) => {
  const food = await Food.findByIdAndUpdate(req.params.id, {
    volunteerId: req.body.volunteerId
  }, { new: true });
  res.json(food);
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const food = await Food.findByIdAndUpdate(req.params.id, {
    status,
    delivered_time: status === 'completed' ? new Date() : undefined
  }, { new: true });
  res.json(food);
};
