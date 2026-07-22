import { z } from 'zod';

export const createAdministratorBodySchema = z.object({
  name: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Valid email is required'),
  role: z.enum(['admin', 'viewer']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateRoleBodySchema = z.object({
  role: z.enum(['admin', 'viewer']),
  reason: z.string().trim().optional(),
});

export const updateStatusBodySchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export const resetPasswordBodySchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
