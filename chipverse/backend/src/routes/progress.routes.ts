import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All progress routes require authentication
router.use(requireAuth);

// ── GET /api/progress/:domainId ───────────────────────────────────────────────
router.get('/:domainId', async (req: Request, res: Response) => {
  try {
    const userId       = (req as any).user.id;
    const { domainId } = req.params;

    const record = await prisma.subLevelProgress.findUnique({
      where: { userId_domainId: { userId, domainId } },
    });

    return res.json({
      domainId,
      completedSubLevels: record?.completedSubLevels ?? [],
    });
  } catch (err) {
    console.error('[Progress] GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ── POST /api/progress/complete ───────────────────────────────────────────────
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const userId                   = (req as any).user.id;
    const { domainId, subLevelId } = req.body;

    if (!domainId || !subLevelId) {
      return res.status(400).json({ error: 'domainId and subLevelId are required' });
    }

    const existing = await prisma.subLevelProgress.findUnique({
      where: { userId_domainId: { userId, domainId } },
    });

    const current = existing?.completedSubLevels ?? [];

    // Skip if already completed
    if (current.includes(subLevelId)) {
      return res.json({ domainId, completedSubLevels: current, alreadyCompleted: true });
    }

    const updated = await prisma.subLevelProgress.upsert({
      where:  { userId_domainId: { userId, domainId } },
      create: { userId, domainId, completedSubLevels: [subLevelId] },
      update: { completedSubLevels: { push: subLevelId } },
    });

    return res.json({
      domainId,
      completedSubLevels: updated.completedSubLevels,
      alreadyCompleted:   false,
    });
  } catch (err) {
    console.error('[Progress] POST error:', err);
    return res.status(500).json({ error: 'Failed to save progress' });
  }
});

// ── DELETE /api/progress/:domainId/reset ──────────────────────────────────────
router.delete('/:domainId/reset', async (req: Request, res: Response) => {
  try {
    const userId       = (req as any).user.id;
    const { domainId } = req.params;

    await prisma.subLevelProgress.deleteMany({ where: { userId, domainId } });

    return res.json({ message: 'Progress reset successfully' });
  } catch (err) {
    console.error('[Progress] DELETE error:', err);
    return res.status(500).json({ error: 'Failed to reset progress' });
  }
});

export default router;