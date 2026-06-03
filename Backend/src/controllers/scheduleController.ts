import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Food from '../models/Food';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';

/** GET /api/schedules — list my recurring schedules */
export const getMySchedules = asyncHandler(async (req: Request, res: Response) => {
  const schedules = await Schedule.find({ donorId: req.user!.id }).sort({ createdAt: -1 });
  res.json(schedules);
});

/** POST /api/schedules */
export const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { label, daysOfWeek, timeHHMM, template } = req.body;
  if (!label || !daysOfWeek?.length || !timeHHMM || !template)
    throw new AppError('label, daysOfWeek, timeHHMM and template are required', 400);

  const schedule = await Schedule.create({
    donorId: req.user!.id,
    label,
    daysOfWeek,
    timeHHMM,
    template,
  });
  res.status(201).json(schedule);
});

/** PATCH /api/schedules/:id */
export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, donorId: req.user!.id });
  if (!schedule) throw new AppError('Schedule not found', 404);

  const allowed = ['label', 'daysOfWeek', 'timeHHMM', 'template', 'active'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allowed.forEach((k) => { if (req.body[k] !== undefined) (schedule as any)[k] = req.body[k]; });

  await schedule.save();
  res.json(schedule);
});

/** DELETE /api/schedules/:id */
export const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, donorId: req.user!.id });
  if (!schedule) throw new AppError('Schedule not found', 404);
  res.json({ message: 'Schedule deleted' });
});

/** POST /api/schedules/:id/run — manually trigger one run */
export const runScheduleNow = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, donorId: req.user!.id });
  if (!schedule) throw new AppError('Schedule not found', 404);

  const t = schedule.template;
  const now = new Date();
  const pickupStart = new Date(now.getTime() + 30 * 60 * 1000);
  const pickupEnd   = new Date(pickupStart.getTime() + t.pickup_duration_hours * 60 * 60 * 1000);
  const expiry      = new Date(pickupEnd.getTime() + 60 * 60 * 1000);

  const food = await Food.create({
    title:                   `[Auto] ${t.title}`,
    description:             t.description,
    quantity:                t.quantity,
    unit:                    t.unit,
    temperature_requirements: t.temperature_requirements,
    dietary_info:            t.dietary_info,
    pickup_location:         t.pickup_location,
    contact_number:          t.contact_number,
    pickup_window_start:     pickupStart,
    pickup_window_end:       pickupEnd,
    expiry_time:             expiry,
    donorId:                 req.user!.id,
    status:                  'available',
  });

  schedule.lastRunAt = now;
  await schedule.save();

  res.status(201).json({ food, schedule });
});
