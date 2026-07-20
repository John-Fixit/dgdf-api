import { z } from 'zod';
import { SITE_CONTENT_KEYS } from '../models/SiteContent.js';

export const contentKeyParamSchema = z.object({
  key: z.enum(SITE_CONTENT_KEYS, {
    error: `Invalid key. Allowed: ${SITE_CONTENT_KEYS.join(', ')}`,
  }),
});

export const updateContentBodySchema = z.object({
  value: z.string({ error: 'value (string) is required' }),
});
