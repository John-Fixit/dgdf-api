import { z } from 'zod';
import { SETTINGS_SECTIONS } from '../models/SiteSettings.js';

export const settingsSectionParamSchema = z.object({
  section: z.enum(SETTINGS_SECTIONS),
});

export const updateSettingsSectionBodySchema = z
  .object({
    data: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();
