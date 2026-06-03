import { z } from 'zod';

/**
 * Zod request schemas. Centralized so validation rules are consistent and
 * documented in one place.
 */

const email = z.string().trim().toLowerCase().email('A valid email is required');
const password = z.string().min(6, 'Password must be at least 6 characters');
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    email,
    password,
    role: z.enum(['donor', 'ngo', 'volunteer', 'admin']),
    organization_name: z.string().trim().optional(),
    contact_number: z.string().trim().optional(),
    ngoId: objectId.optional(),
  })
  .refine(
    (d) => d.role !== 'ngo' || (!!d.organization_name && !!d.contact_number),
    { message: 'Organization name and contact number are required for NGOs', path: ['organization_name'] }
  );

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({ password });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  organization_name: z.string().trim().optional(),
  contact_number: z.string().trim().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email,
  subject: z.string().trim().min(2, 'Subject is required'),
  message: z.string().trim().min(5, 'Message is required'),
});

const foodStatus = z.enum(['available', 'in_progress', 'assigned', 'completed']);

export const updateDonationStatusSchema = z.object({
  status: z.enum(['available', 'assigned', 'completed']),
  ngoId: objectId.optional(),
});

export const updateFoodStatusSchema = z.object({ status: foodStatus });

export const claimFoodSchema = z.object({ foodId: objectId });

export const assignVolunteerSchema = z.object({
  volunteerId: objectId,
  foodId: objectId,
});

export const volunteerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email,
  contact_number: z.string().trim().min(1, 'Contact number is required'),
});

export const sendNotificationSchema = z.object({
  recipientId: objectId,
  message: z.string().trim().min(1, 'Message is required'),
  taskId: objectId.optional(),
});
