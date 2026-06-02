import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Food from '../models/Food';
import Notification from '../models/Notification';
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

// NGO notifications
export const getNgoNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ recipientId: req.user!.id })
    .populate('taskId', 'title')
    .sort({ createdAt: -1 });
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
