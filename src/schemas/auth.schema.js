import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Valid email is required'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const changePasswordBodySchema = z
  .object({
    currentPassword: z
      .string({ error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ error: 'New password is required' })
      .min(8, 'New password must be at least 8 characters'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const updateProfileBodySchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
});
