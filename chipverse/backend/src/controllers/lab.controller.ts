import { Request, Response } from 'express';
import { evaluateLab } from '../services/lab.service';

export const evaluate = async (req: Request, res: Response) => {
  try {
    const { labId, code, requiredPatterns, forbiddenPatterns, xp } = req.body;
    const userId = req.user!.id;

    if (!labId || !code || !requiredPatterns) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await evaluateLab({
      labId,
      code,
      requiredPatterns,
      forbiddenPatterns: forbiddenPatterns ?? [],
      xp: xp ?? 0,
      userId,
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Lab evaluation error:', err);
    return res.status(500).json({ success: false, message: 'Evaluation failed' });
  }
};