import { z } from 'zod';

export const createLeadershipBodySchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  bio: z.string().trim().optional().default(''),
  photoUrl: z.string().trim().optional(),
  sortOrder: z.coerce.number().optional().default(0),
  status: z.enum(['published', 'draft']).optional().default('published'),
  isFounder: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .default(false),
});

export const updateLeadershipBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  bio: z.string().trim().optional(),
  photoUrl: z.string().trim().optional(),
  sortOrder: z.coerce.number().optional(),
  status: z.enum(['published', 'draft']).optional(),
  isFounder: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
});
