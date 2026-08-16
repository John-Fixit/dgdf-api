import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  protect,
  adminOnly,
  optionalProtect,
} from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  loginBodySchema,
  changePasswordBodySchema,
  updateProfileBodySchema,
} from '../schemas/auth.schema.js';
import {
  login,
  logout,
  me,
  heartbeat,
  changePassword,
  updateProfile,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', validate({ body: loginBodySchema }), asyncHandler(login));
router.post('/logout', optionalProtect, asyncHandler(logout));
router.get('/me', protect, asyncHandler(me));
router.post('/heartbeat', protect, asyncHandler(heartbeat));

router.patch(
  '/change-password',
  protect,
  adminOnly,
  validate({ body: changePasswordBodySchema }),
  asyncHandler(changePassword)
);

router.patch(
  '/update-profile',
  protect,
  adminOnly,
  validate({ body: updateProfileBodySchema }),
  asyncHandler(updateProfile)
);

export default router;
