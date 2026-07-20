import { z } from 'zod';

/** Non-empty string path/query id (supports both ObjectId and mock ids). */
export const idParamSchema = z.object({
  id: z
    .string({ error: 'id is required' })
    .trim()
    .min(1, 'id is required'),
});
