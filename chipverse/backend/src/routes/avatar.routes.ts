import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getAvatars,
  selectPresetAvatar,
  saveCustomAvatarConfig,
  getCustomAvatar,
} from '../controllers/avatar.controller';

const router = Router();

// Public — no auth needed to browse avatars
router.get('/', getAvatars);

// Protected
router.use(requireAuth);
router.patch('/preset',  selectPresetAvatar);
router.patch('/custom',  saveCustomAvatarConfig);
router.get('/custom',    getCustomAvatar);

export default router;