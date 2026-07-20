import { z } from 'zod';

export const createGalleryBodySchema = z.object({
  caption: z.string().trim().optional().default(''),
  category: z.string().trim().optional().default('general'),
});
