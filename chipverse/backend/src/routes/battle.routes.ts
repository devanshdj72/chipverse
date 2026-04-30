import { Router } from 'express';
import { challenge, respondBattle, submitScore, getBattles, getBattle } from '../controllers/battle.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', getBattles);
router.post('/challenge', challenge);
router.get('/:battleId', getBattle);
router.patch('/:battleId/respond', respondBattle);
router.post('/:battleId/score', submitScore);

export default router;
