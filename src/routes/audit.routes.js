import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  protect,
  adminOnly,
  superAdminOnly,
} from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { listAuditQuerySchema } from '../schemas/audit.schema.js';
import {
  getAuditLogs,
  deleteAuditLogs,
} from '../controllers/audit.controller.js';

const router = Router();

router.get(
  '/',
  protect,
  adminOnly,
  validate({ query: listAuditQuerySchema }),
  asyncHandler(getAuditLogs)
);

router.delete('/', protect, superAdminOnly, asyncHandler(deleteAuditLogs));

export default router;
