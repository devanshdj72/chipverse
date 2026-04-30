import { Request, Response, NextFunction } from 'express';
import {
  createBattle,
  respondToBattle,
  submitBattleScore,
  getUserBattles,
  getBattleById,
} from '../services/battle.service';
import { sendSuccess, sendError } from '../utils/response';

export const challenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { opponentId, domainId, betXp, mode } = req.body;
    if (!opponentId || !domainId || !betXp) return sendError(res, 'opponentId, domainId and betXp are required');
    const battleMode = mode === 'LIVE' ? 'LIVE' : 'OFFLINE';
    const battle = await createBattle(req.user!.userId, opponentId, domainId, Number(betXp), battleMode);
    return sendSuccess(res, battle, 'Battle challenge sent!', 201);
  } catch (err) { return next(err); }
};

export const respondBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { battleId } = req.params;
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) return sendError(res, 'Action must be accept or decline');
    const battle = await respondToBattle(battleId, req.user!.userId, action);
    return sendSuccess(res, battle, action === 'accept' ? 'Battle accepted! Fight!' : 'Battle declined');
  } catch (err) { return next(err); }
};

export const submitScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { battleId } = req.params;
    const { score, timeTakenMs } = req.body;
    if (score === undefined) return sendError(res, 'score is required');
    const result = await submitBattleScore(battleId, req.user!.userId, Number(score), Number(timeTakenMs ?? 0));
    return sendSuccess(res, result, 'Score submitted');
  } catch (err) { return next(err); }
};

export const getBattles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const battles = await getUserBattles(req.user!.userId);
    return sendSuccess(res, battles, 'Battles');
  } catch (err) { return next(err); }
};

export const getBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const battle = await getBattleById(req.params.battleId, req.user!.userId);
    return sendSuccess(res, battle, 'Battle');
  } catch (err) { return next(err); }
};