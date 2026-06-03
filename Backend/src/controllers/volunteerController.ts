import { Request, Response } from 'express';
import Food from '../models/Food';
import User from '../models/User';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { emitNotification } from '../utils/notify';
import uploadImage from '../utils/uploadImage';

export const getVolunteerStats = asyncHandler(async (req: Request, res: Response) => {
  const volunteerId = req.user!.id;

  const [available_Task, in_progress_task, completed_task] = await Promise.all([
    Food.countDocuments({ volunteerId, status: 'assigned' }),
    Food.countDocuments({ volunteerId, status: 'in_progress' }),
    Food.countDocuments({ volunteerId, status: 'completed' }),
  ]);

  res.status(200).json({
    available_Task,
    in_progress_task,
    Completed_task: completed_task,
  });
});

export const getVolunteerTasks = asyncHandler(async (req: Request, res: Response) => {
  const volunteerId = req.user!.id;
  const tasks = await Food.find({ volunteerId })
    .populate('ngoId', 'organization_name')
    .populate('donorId', 'name email')
    .sort({ updatedAt: -1 });
  res.status(200).json(tasks);
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const volunteerId = req.user!.id;

  const task = await Food.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);

  if (task.volunteerId?.toString() !== volunteerId) {
    throw new AppError('Not authorized to update this task', 403);
  }

  const previousStatus = task.status;
  task.status = status;

  if (status === 'completed') {
    task.delivered_time = new Date();
    if (req.file) {
      const proofUrl = await uploadImage(req.file);
      (task as typeof task & { delivery_proof_img?: string }).delivery_proof_img = proofUrl;
    }
  }

  await task.save();

  if (status === 'in_progress' && previousStatus !== 'in_progress' && task.ngoId) {
    await emitNotification({
      recipientId: task.ngoId,
      message: `Task "${task.title}" is now in progress.`,
      taskId: task._id,
      type: 'in_progress',
    });
  } else if (status === 'completed' && previousStatus !== 'completed') {
    if (task.ngoId) {
      await emitNotification({
        recipientId: task.ngoId,
        message: `Task "${task.title}" has been completed.`,
        taskId: task._id,
        type: 'completed',
      });
    }
    if (task.donorId) {
      await emitNotification({
        recipientId: task.donorId,
        message: `Your donation "${task.title}" has been completed.`,
        taskId: task._id,
        type: 'completed',
      });
    }
    const volunteer = await User.findById(volunteerId);
    if (volunteer) {
      volunteer.rating = Math.min((volunteer.rating || 0) + 0.5, 5);
      volunteer.completedOrders = (volunteer.completedOrders || 0) + 1;
      await volunteer.save();
    }
  }

  res.status(200).json({ message: 'Task status updated', task });
});

export const getVolunteerNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ recipientId: req.user!.id })
    .populate('taskId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json(notifications);
});

export const markVolunteerNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipientId: req.user!.id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  res.status(200).json({ message: 'Notification marked as read', notification });
});
