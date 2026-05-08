import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getAllPresetAvatars,
  savePresetAvatar,
  saveCustomAvatar,
  getCustomAvatarConfig,
} from '../services/avatar.service';
import { SKIN_TONES, HAIR_STYLES, FACE_SHAPES, FACIAL_HAIR, ACCESSORIES, OUTFITS } from '../data/avatars.data';
import { sendSuccess, sendError } from '../utils/response';

// ── Validation Schemas ────────────────────────────────────────────────────────

const presetSchema = z.object({
  avatarId: z.string().min(1, 'avatarId is required'),
});

const customAvatarSchema = z.object({
  skinTone:    z.enum(SKIN_TONES),
  hairStyle:   z.enum(HAIR_STYLES),
  hairColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'hairColor must be a valid hex color'),
  eyeColor:    z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'eyeColor must be a valid hex color'),
  faceShape:   z.enum(FACE_SHAPES),
  facialHair:  z.enum(FACIAL_HAIR),
  accessories: z.enum(ACCESSORIES),
  outfit:      z.enum(OUTFITS),
});

// ── Controllers ───────────────────────────────────────────────────────────────

// GET /api/user/avatars
export const getAvatars = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = getAllPresetAvatars();
    return sendSuccess(res, data, 'Avatars fetched');
  } catch (err) { return next(err); }
};

// PATCH /api/user/avatar/preset
export const selectPresetAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatarId } = presetSchema.parse(req.body);
    const user = await savePresetAvatar(req.user!.userId, avatarId);
    return sendSuccess(res, user, 'Avatar updated');
  } catch (err) { return next(err); }
};

// PATCH /api/user/avatar/custom
export const saveCustomAvatarConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = customAvatarSchema.parse(req.body);
    const user = await saveCustomAvatar(req.user!.userId, config);
    return sendSuccess(res, user, 'Custom avatar saved');
  } catch (err) { return next(err); }
};

// GET /api/user/avatar/custom
export const getCustomAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getCustomAvatarConfig(req.user!.userId);
    return sendSuccess(res, data, 'Custom avatar config fetched');
  } catch (err) { return next(err); }
};