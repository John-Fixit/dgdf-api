import { z } from 'zod';

export const createMilestoneBodySchema = z.object({
  year: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  sortOrder: z.coerce.number().optional().default(0),
});

export const updateMilestoneBodySchema = z.object({
  year: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  sortOrder: z.coerce.number().optional(),
});
