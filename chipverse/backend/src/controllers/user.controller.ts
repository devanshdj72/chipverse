import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getUserProfile,
  updateProgress,
  setCurrentDomain,
  updateStreak,
} from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';

const progressSchema = z.object({
  domainId: z.string(),
  levelId: z.number().int().min(0),
  xpGained: z.number().int().min(0),
});

const domainSchema = z.object({
  domainId: z.string(),
});

/** GET /api/user/profile */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUserProfile(req.user!.userId);
    return sendSuccess(res, data, 'Profile fetched');
  } catch (err) {
    return next(err);
  }
};

/** POST /api/user/progress */
export const completeLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domainId, levelId, xpGained } = progressSchema.parse(req.body);
    const data = await updateProgress(req.user!.userId, domainId, levelId, xpGained);
    await updateStreak(req.user!.userId);
    return sendSuccess(res, data, 'Progress updated');
  } catch (err) {
    return next(err);
  }
};

/** PATCH /api/user/domain */
export const changeDomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domainId } = domainSchema.parse(req.body);
    const profile = await setCurrentDomain(req.user!.userId, domainId);
    return sendSuccess(res, profile, 'Current domain updated');
  } catch (err) {
    return next(err);
  }
};
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
});

/** PATCH /api/user/profile */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const { updateUserProfile } = await import('../services/user.service');
    const user = await updateUserProfile(req.user!.userId, data);
    return sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    return next(err);
  }
};
import { getLeaderboard, getSiteStats } from '../services/user.service';

/** GET /api/user/leaderboard */
export const leaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getLeaderboard(20);
    return sendSuccess(res, data, 'Leaderboard fetched');
  } catch (err) {
    return next(err);
  }
};

/** GET /api/user/stats */
export const siteStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getSiteStats();
    return sendSuccess(res, data, 'Stats fetched');
  } catch (err) {
    return next(err);
  }
};
