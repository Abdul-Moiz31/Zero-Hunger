import { Request, Response } from 'express';
import User from '../models/User';
import Food from '../models/Food';
import asyncHandler from '../utils/asyncHandler';

/**
 * GET /api/impact  (public, no auth required)
 * Returns aggregate platform-level statistics for the public impact dashboard.
 */
export const getImpactStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    mealsRescuedResult,
    totalListings,
    completedListings,
    activeNGOs,
    activeDonors,
    activeVolunteers,
  ] = await Promise.all([
    // Sum quantities of all completed food donations
    Food.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
    Food.countDocuments(),
    Food.countDocuments({ status: 'completed' }),
    User.countDocuments({ role: 'ngo', isApproved: true, status: 'Active' }),
    User.countDocuments({ role: 'donor', isApproved: true, status: 'Active' }),
    User.countDocuments({ role: 'volunteer', isApproved: true, status: 'Active' }),
  ]);

  const mealsRescued = mealsRescuedResult[0]?.total ?? 0;
  // Rough conversions: 1 meal ≈ 0.5 kg; 1 kg food waste ≈ 0.72 kg CO₂
  const kgSaved = Math.round(mealsRescued * 0.5);
  const co2Avoided = +(kgSaved * 0.00072).toFixed(1); // tonnes

  res.json({
    mealsRescued,
    kgSaved,
    co2Avoided,
    activeNGOs,
    activeDonors,
    activeVolunteers,
    totalDeliveries: completedListings,
    totalListings,
  });
});
