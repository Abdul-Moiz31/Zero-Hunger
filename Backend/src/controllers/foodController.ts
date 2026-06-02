import { Request, Response } from 'express';
import Food from '../models/Food';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Public listing of food donations that are available and unclaimed.
 * Used by the public /listings page and by NGOs browsing donations.
 */
export const getAvailableFoods = asyncHandler(async (_req: Request, res: Response) => {
  const foods = await Food.find({
    status: 'available',
    $or: [{ ngoId: { $exists: false } }, { ngoId: null }],
  })
    .populate('donorId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(foods);
});
