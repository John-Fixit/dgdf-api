import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, editorOnly } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  settingsSectionParamSchema,
  updateSettingsSectionBodySchema,
} from '../schemas/settings.schema.js';
import {
  getSettings,
  updateSettingsSection,
} from '../controllers/settings.controller.js';

const router = Router();

router.get('/', asyncHandler(getSettings));
router.patch(
  '/:section',
  protect,
  editorOnly,
  validate({
    params: settingsSectionParamSchema,
    body: updateSettingsSectionBodySchema,
  }),
  asyncHandler(updateSettingsSection)
);

export default router;
