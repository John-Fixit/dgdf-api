import { z } from 'zod';

export const initiateDonationBodySchema = z.object({
  donorName: z
    .string({ error: 'donorName is required' })
    .trim()
    .min(1, 'donorName is required'),
  email: z
    .string({ error: 'email is required' })
    .trim()
    .email('Valid email is required'),
  amount: z.coerce
    .number({ error: 'amount is required' })
    .positive('amount must be a positive number'),
  currency: z.enum(['NGN', 'USD']).optional().default('NGN'),
  isAnonymous: z.boolean().optional().default(false),
});

export const verifyDonationBodySchema = z.object({
  reference: z
    .string({ error: 'reference is required' })
    .trim()
    .min(1, 'reference is required'),
});
