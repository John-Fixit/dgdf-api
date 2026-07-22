import { z } from 'zod';
import { CONTENT_PAGES } from '../models/SiteContent.js';

export const contentPageParamSchema = z.object({
  page: z.enum(CONTENT_PAGES),
  section: z.string().min(1),
});

export const updateContentSectionBodySchema = z
  .object({
    data: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  })
  .passthrough();
