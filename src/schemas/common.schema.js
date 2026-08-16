import { z } from 'zod';

/** Non-empty string path/query id (Mongo ObjectId). */
export const idParamSchema = z.object({
  id: z
    .string({ error: 'id is required' })
    .trim()
    .min(1, 'id is required'),
});
