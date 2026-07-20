import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginBodySchema } from '../schemas/auth.schema.js';
import { login, logout, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', validate({ body: loginBodySchema }), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', protect, asyncHandler(me));

export default router;
