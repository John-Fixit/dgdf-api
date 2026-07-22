import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  protect,
  requireRoles,
  superAdminOnly,
} from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';
import {
  createAdministratorBodySchema,
  updateRoleBodySchema,
  updateStatusBodySchema,
  resetPasswordBodySchema,
} from '../schemas/administrator.schema.js';
import {
  getAdministrators,
  createAdministrator,
  updateAdministratorRole,
  updateAdministratorStatus,
  resetAdministratorPassword,
} from '../controllers/administrator.controller.js';

const router = Router();

router.get(
  '/',
  protect,
  requireRoles('super_admin', 'admin'),
  asyncHandler(getAdministrators)
);

router.post(
  '/',
  protect,
  superAdminOnly,
  validate({ body: createAdministratorBodySchema }),
  asyncHandler(createAdministrator)
);

router.patch(
  '/:id/role',
  protect,
  superAdminOnly,
  validate({ params: idParamSchema, body: updateRoleBodySchema }),
  asyncHandler(updateAdministratorRole)
);

router.patch(
  '/:id/status',
  protect,
  superAdminOnly,
  validate({ params: idParamSchema, body: updateStatusBodySchema }),
  asyncHandler(updateAdministratorStatus)
);

router.patch(
  '/:id/reset-password',
  protect,
  superAdminOnly,
  validate({ params: idParamSchema, body: resetPasswordBodySchema }),
  asyncHandler(resetAdministratorPassword)
);

export default router;
