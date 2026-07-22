import { z } from 'zod';

export const createGalleryBodySchema = z.object({
  title: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  description: z.string().trim().optional().default(''),
  category: z.string().trim().optional().default('General'),
  status: z.enum(['active', 'draft', 'archived']).optional().default('active'),
  sortOrder: z.coerce.number().optional().default(0),
  mediaType: z.enum(['image', 'video']).optional().default('image'),
  location: z.string().trim().optional().default(''),
});

export const updateGalleryBodySchema = z.object({
  title: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  sortOrder: z.coerce.number().optional(),
  mediaType: z.enum(['image', 'video']).optional(),
  location: z.string().trim().optional(),
});
