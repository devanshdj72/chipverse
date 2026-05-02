import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { evaluate } from '../controllers/lab.controller';

const router = Router();

router.use(requireAuth);
router.post('/evaluate', evaluate);

export default router;