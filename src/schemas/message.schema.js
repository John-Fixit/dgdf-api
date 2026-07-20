import { z } from 'zod';

export const createMessageBodySchema = z.object({
  name: z
    .string({ error: 'name is required' })
    .trim()
    .min(1, 'name is required'),
  email: z
    .string({ error: 'email is required' })
    .trim()
    .email('Valid email is required'),
  phone: z.string().trim().optional().default(''),
  message: z
    .string({ error: 'message is required' })
    .trim()
    .min(1, 'message is required'),
});
