import { Router } from 'express';
import { getProfile, completeLevel, changeDomain, updateProfile, leaderboard, siteStats } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { addXp } from "../controllers/xp.controller";

const router = Router();

// Public
router.get('/leaderboard', leaderboard);
router.get('/stats', siteStats);

// Protected
router.use(requireAuth);
router.get('/profile', getProfile);
router.post('/progress', completeLevel);
router.patch('/domain', changeDomain);
router.patch('/profile', updateProfile);
router.post("/xp", requireAuth, addXp);

export default router;