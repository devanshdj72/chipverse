import { Router } from 'express';
import { getProfile, completeLevel, changeDomain } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', getProfile);
router.post('/progress', completeLevel);
router.patch('/domain', changeDomain);

export default router;
