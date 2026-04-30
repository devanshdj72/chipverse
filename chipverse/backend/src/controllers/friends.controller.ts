import { Request, Response, NextFunction } from 'express';
import {
  sendFriendRequest,
  respondToFriendRequest,
  unfriend,
  getFriends,
  getPendingRequests,
  searchUsers,
  getFriendsLeaderboard,
  getSentRequests,
} from '../services/friends.service';
import { sendSuccess, sendError } from '../utils/response';

export const searchUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) return sendError(res, 'Search query must be at least 2 characters');
    const users = await searchUsers(q, req.user!.userId);
    return sendSuccess(res, users, 'Users found');
  } catch (err) { return next(err); }
};

export const sendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return sendError(res, 'receiverId is required');
    const request = await sendFriendRequest(req.user!.userId, receiverId);
    return sendSuccess(res, request, 'Friend request sent', 201);
  } catch (err) { return next(err); }
};

export const respondRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) return sendError(res, 'Action must be accept or reject');
    const result = await respondToFriendRequest(requestId, req.user!.userId, action);
    return sendSuccess(res, result, action === 'accept' ? 'Friend request accepted' : 'Friend request rejected');
  } catch (err) { return next(err); }
};

export const unfriendHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { friendId } = req.params;
    await unfriend(req.user!.userId, friendId);
    return sendSuccess(res, null, 'Unfriended successfully');
  } catch (err) { return next(err); }
};

export const getFriendsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friends = await getFriends(req.user!.userId);
    return sendSuccess(res, friends, 'Friends list');
  } catch (err) { return next(err); }
};

export const getPendingRequestsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await getPendingRequests(req.user!.userId);
    return sendSuccess(res, requests, 'Pending requests');
  } catch (err) { return next(err); }
};

export const getFriendsLeaderboardHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lb = await getFriendsLeaderboard(req.user!.userId);
    return sendSuccess(res, lb, 'Friends leaderboard');
  } catch (err) { return next(err); }
};
export const getSentRequestsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await getSentRequests(req.user!.userId);
    return sendSuccess(res, requests, 'Sent requests');
  } catch (err) { return next(err); }
};
