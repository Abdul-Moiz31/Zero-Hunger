import { Request, Response } from 'express';
import Food from '../models/Food';

export const addFood = async (req: any, res: Response) => {
  const food = new Food({ ...req.body, userId: req.user.id });
  await food.save();
  res.status(201).json(food);
};

export const getAvailableFoods = async (_req: Request, res: Response) => {
  const foods = await Food.find({ status: 'available' });
  res.json(foods);
};

export const acceptFood = async (req: any, res: Response) => {
  const food = await Food.findByIdAndUpdate(req.params.id, {
    ngoId: req.user.id,
    status: 'assigned',
    acceptance_time: new Date()
  }, { new: true });
  res.json(food);
};

export const assignVolunteer = async (req: Request, res: Response) => {
  const food = await Food.findByIdAndUpdate(req.params.id, {
    volunteerId: req.body.volunteerId
  }, { new: true });
  res.json(food);
};

export const updateStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const food = await Food.findByIdAndUpdate(req.params.id, {
    status,
    delivered_time: status === 'completed' ? new Date() : undefined
  }, { new: true });
  res.json(food);
};
