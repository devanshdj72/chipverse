import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { generate, getReport, getSharedReport } from '../controllers/report.controller';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────
router.get('/share/:shareToken', getSharedReport);

// ── Protected ──────────────────────────────────────────────────────────────────
router.use(requireAuth);
router.post('/generate',       generate);
router.get('/:domainId',       getReport);

export default router;