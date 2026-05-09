import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateReport, getMyReport, getReportByToken } from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response';

// ── Validation ────────────────────────────────────────────────────────────────
const subLevelBreakdownSchema = z.object({
  concept:     z.object({ completed: z.number(), total: z.number() }),
  syntax:      z.object({ completed: z.number(), total: z.number() }),
  walkthrough: z.object({ completed: z.number(), total: z.number() }),
  lab:         z.object({ completed: z.number(), total: z.number() }),
  quiz:        z.object({ completed: z.number(), total: z.number() }),
});

const levelDetailSchema = z.object({
  levelId:            z.number(),
  title:              z.string(),
  status:             z.enum(['completed', 'in_progress', 'not_started']),
  xpEarned:           z.number(),
  subLevelsCompleted: z.number(),
  totalSubLevels:     z.number(),
  badge:              z.string().optional(),
});

const generateSchema = z.object({
  domainId:             z.string(),
  domainName:           z.string(),
  totalXpEarned:        z.number(),
  levelsCompleted:      z.number(),
  totalLevels:          z.number(),
  subLevelsCompleted:   z.number(),
  totalSubLevels:       z.number(),
  completionPercentage: z.number(),
  subLevelBreakdown:    subLevelBreakdownSchema,
  levelDetails:         z.array(levelDetailSchema),
  badgesEarned:         z.array(z.string()),
  strengths:            z.array(z.string()),
  improvements:         z.array(z.string()),
});

// ── POST /api/report/generate ─────────────────────────────────────────────────
export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = generateSchema.parse(req.body);
    const report  = await generateReport(req.user!.userId, payload);
    return sendSuccess(res, report, 'Report generated');
  } catch (err) { return next(err); }
};

// ── GET /api/report/:domainId ─────────────────────────────────────────────────
export const getReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await getMyReport(req.user!.userId, req.params.domainId);
    if (!report) return sendError(res, 'Report not found — generate one first', 404);
    return sendSuccess(res, report, 'Report fetched');
  } catch (err) { return next(err); }
};

// ── GET /api/report/share/:shareToken  (PUBLIC — no auth) ─────────────────────
export const getSharedReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await getReportByToken(req.params.shareToken);
    if (!report || !report.isPublic) return sendError(res, 'Report not found', 404);
    return sendSuccess(res, report, 'Report fetched');
  } catch (err) { return next(err); }
};