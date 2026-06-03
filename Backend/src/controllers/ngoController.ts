import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Food from '../models/Food';
import Notification from '../models/Notification';
import Rating from '../models/Rating';
import { sendVolunteerConfirmationEmail } from '../emails/sendVolunteerConfirmationEmail';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { emitNotification } from '../utils/notify';

// Dashboard stats for NGO
export const getNgoStats = asyncHandler(async (req: Request, res: Response) => {
  const ngoId = req.user!.id;

  const [totalVolunteers, totalCompletedDonations, totalPendingDonations] = await Promise.all([
    User.countDocuments({ ngoId, role: 'volunteer', isApproved: true }),
    Food.countDocuments({ ngoId, status: 'completed' }),
    Food.countDocuments({ ngoId, status: 'assigned' }),
  ]);

  res.status(200).json({ totalVolunteers, totalCompletedDonations, totalPendingDonations });
});

// Volunteers linked to this NGO (by ngoId, falling back to org name for legacy data)
export const getMyVolunteers = asyncHandler(async (req: Request, res: Response) => {
  const ngoId = req.user!.id;
  const ngo = await User.findById(ngoId);
  if (!ngo) throw new AppError('NGO not found', 404);

  const volunteers = await User.find({
    role: 'volunteer',
    $or: [{ ngoId }, { organization_name: ngo.organization_name }],
  }).select('-password');

  res.status(200).json(volunteers);
});

// NGO claims an available food donation
export const claimFood = asyncHandler(async (req: Request, res: Response) => {
  const { foodId } = req.body;
  const ngoId = req.user!.id;

  const food = await Food.findById(foodId);
  if (!food) throw new AppError('Food listing not found', 404);
  if (food.ngoId) throw new AppError('This donation has already been claimed', 409);

  food.ngoId = new mongoose.Types.ObjectId(ngoId) as never;
  food.status = 'assigned';
  food.acceptance_time = new Date();
  await food.save();

  const ngo = await User.findById(ngoId);
  await emitNotification({
    recipientId: food.donorId,
    message: `Your donation "${food.title}" has been claimed by ${ngo?.organization_name || 'an NGO'}.`,
    taskId: food._id,
    type: 'claimed',
  });

  res.status(200).json({ success: true, message: 'Food claimed successfully', data: food });
});

export const getClaimedFoods = asyncHandler(async (req: Request, res: Response) => {
  const ngoId = req.user!.id;

  const claimedFoods = await Food.find({
    ngoId,
    status: { $in: ['assigned', 'in_progress'] },
  })
    .populate({ path: 'donorId volunteerId', select: 'name email' })
    .sort({ acceptance_time: -1 });

  res.status(200).json({ success: true, data: claimedFoods });
});

// Delete a volunteer that belongs to this NGO
export const deleteVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ngoId = req.user!.id;

  const ngo = await User.findById(ngoId);
  if (!ngo) throw new AppError('NGO not found', 404);

  const volunteer = await User.findOne({
    _id: id,
    role: 'volunteer',
    $or: [{ ngoId }, { organization_name: ngo.organization_name }],
  });
  if (!volunteer) throw new AppError('Volunteer not found or not associated with this NGO', 404);

  await User.findByIdAndDelete(id);
  res.status(200).json({ success: true, message: 'Volunteer deleted successfully' });
});

export const updateVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, contact_number } = req.body;
  const ngoId = req.user!.id;

  const ngo = await User.findById(ngoId);
  if (!ngo) throw new AppError('NGO not found', 404);

  const volunteer = await User.findOneAndUpdate(
    { _id: id, role: 'volunteer', $or: [{ ngoId }, { organization_name: ngo.organization_name }] },
    { name, email, contact_number },
    { new: true, runValidators: true }
  ).select('-password');
  if (!volunteer) throw new AppError('Volunteer not found or not associated with this NGO', 404);

  res.status(200).json({ success: true, message: 'Volunteer updated successfully', data: volunteer });
});

// NGO creates a volunteer directly (auto-approved, emailed a generated password)
export const addVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, contact_number } = req.body;
  const ngoId = req.user!.id;

  const ngo = await User.findById(ngoId);
  if (!ngo || ngo.role !== 'ngo') throw new AppError('NGO not found', 404);

  const existingVolunteer = await User.findOne({ email });
  if (existingVolunteer) throw new AppError('A user with this email already exists', 409);

  const randomPassword = Math.random().toString(36).slice(-10);
  const registeredTime = new Date();

  const volunteer = new User({
    name,
    email,
    password: randomPassword,
    contact_number,
    role: 'volunteer',
    organization_name: ngo.organization_name,
    status: 'Active',
    completedOrders: 0,
    joinedDate: registeredTime,
    ngoId,
    isApproved: true,
  });
  await volunteer.save();

  await sendVolunteerConfirmationEmail({
    to: email,
    name,
    password: randomPassword,
    organization_name: ngo.organization_name || '',
    registered_time: registeredTime.toISOString(),
  });

  const volunteerResponse = await User.findById(volunteer._id).select('-password');
  res.status(201).json(volunteerResponse);
});

// NGO updates the status of one of its claimed foods
export const updateFoodStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const ngoId = new mongoose.Types.ObjectId(req.user!.id);

  const food = await Food.findOneAndUpdate(
    { _id: id, ngoId },
    { status, ...(status === 'completed' ? { delivered_time: new Date() } : {}) },
    { new: true }
  ).populate('volunteerId', 'name');
  if (!food) throw new AppError('Food donation not found', 404);

  if (status === 'completed' && food.donorId) {
    const volunteerName = (food.volunteerId as unknown as { name?: string })?.name || 'a volunteer';
    await emitNotification({
      recipientId: food.donorId,
      message: `Your donation "${food.title}" has been completed by ${volunteerName}.`,
      taskId: food._id,
      type: 'completed',
    });
  }

  res.status(200).json({ message: 'Food status updated successfully', food });
});

export const deleteClaimedFood = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ngoId = req.user!.id;

  const food = await Food.findOneAndDelete({ _id: id, ngoId });
  if (!food) throw new AppError('Food donation not found', 404);

  res.status(200).json({ message: 'Claimed food deleted successfully' });
});

// NGO assigns a volunteer to a claimed food task
export const assignVolunteerToFood = asyncHandler(async (req: Request, res: Response) => {
  const { volunteerId, foodId } = req.body;
  const ngoId = req.user!.id;

  const food = await Food.findOne({ _id: foodId, ngoId });
  if (!food) throw new AppError('Food item not found or not claimed by your NGO', 404);

  const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer' });
  if (!volunteer) throw new AppError('Volunteer not found', 404);

  food.volunteerId = new mongoose.Types.ObjectId(volunteerId) as never;
  food.status = 'assigned';
  await food.save();

  const ngo = await User.findById(ngoId);
  await emitNotification({
    recipientId: volunteer._id,
    message: `A new task "${food.title}" has been assigned to you by ${ngo?.organization_name || 'an NGO'}.`,
    taskId: food._id,
    type: 'assigned',
  });

  res.status(200).json({ message: 'Volunteer assigned successfully', food });
});

// NGO rates a volunteer after a completed delivery
export const rateVolunteer = asyncHandler(
  async (req: Request<{ volunteerId: string }, object, { foodId: string; stars: number; comment?: string }>, res: Response) => {
    const { volunteerId } = req.params;
    const { foodId, stars, comment } = req.body;
    const ngoId = req.user!.id;

    // Verify the food was completed and belongs to this NGO
    const food = await Food.findOne({ _id: foodId, ngoId, status: 'completed', volunteerId });
    if (!food) throw new AppError('Completed delivery not found for this volunteer and NGO', 404);

    const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer' });
    if (!volunteer) throw new AppError('Volunteer not found', 404);

    // Upsert (allow updating a rating once)
    await Rating.findOneAndUpdate(
      { ngoId, foodId },
      { ngoId, volunteerId, foodId, stars, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate volunteer's average rating
    const allRatings = await Rating.find({ volunteerId });
    const avgRating = allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length;
    volunteer.rating = Math.round(avgRating * 10) / 10;
    await volunteer.save();

    // Notify volunteer
    await emitNotification({
      recipientId: volunteer._id,
      message: `You received a ${stars}-star rating for your delivery of "${food.title}".`,
      taskId: food._id,
      type: 'general',
    });

    res.status(200).json({ message: 'Rating submitted', avgRating: volunteer.rating });
  }
);

// NGO inventory: completed deliveries with optional date-range filter
export const getNgoInventory = asyncHandler(async (req: Request, res: Response) => {
  const ngoId = new mongoose.Types.ObjectId(req.user!.id);
  const days = Math.min(Math.max(parseInt(String(req.query.days || '30')), 1), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const completedFoods = await Food.find({
    ngoId,
    status: 'completed',
    delivered_time: { $gte: since },
  })
    .populate('donorId', 'name')
    .populate('volunteerId', 'name')
    .sort({ delivered_time: -1 });

  const totalMeals = completedFoods.reduce((sum, f) => sum + (f.quantity || 0), 0);
  const totalDeliveries = completedFoods.length;

  // Category breakdown from dietary_info field
  const categoryMap: Record<string, number> = {};
  completedFoods.forEach((f) => {
    const cat = (f.dietary_info as string | undefined)?.trim() || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

  res.status(200).json({ totalMeals, totalDeliveries, categories, deliveries: completedFoods });
});

// NGO confirms a completed delivery (closes the accountability loop)
export const confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ngoId = new mongoose.Types.ObjectId(req.user!.id);

  const food = await Food.findOne({ _id: id, ngoId, status: 'completed' });
  if (!food) throw new AppError('Completed donation not found for your NGO', 404);

  (food as typeof food & { ngo_confirmed?: boolean; ngo_confirmed_at?: Date }).ngo_confirmed = true;
  (food as typeof food & { ngo_confirmed?: boolean; ngo_confirmed_at?: Date }).ngo_confirmed_at = new Date();
  await food.save();

  // Notify donor that the delivery has been verified
  await emitNotification({
    recipientId: food.donorId,
    message: `Your donation "${food.title}" delivery has been confirmed by the NGO.`,
    taskId: food._id,
    type: 'delivery_confirmed',
  });

  // Notify volunteer
  if (food.volunteerId) {
    await emitNotification({
      recipientId: food.volunteerId,
      message: `Your delivery of "${food.title}" has been confirmed. Great work!`,
      taskId: food._id,
      type: 'delivery_confirmed',
    });
  }

  res.status(200).json({ message: 'Delivery confirmed', food });
});

// NGO notifications
export const getNgoNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ recipientId: req.user!.id })
    .populate('taskId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json(notifications);
});

export const markNgoNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipientId: req.user!.id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  res.status(200).json({ message: 'Notification marked as read', notification });
});
