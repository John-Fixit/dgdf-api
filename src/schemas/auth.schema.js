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
