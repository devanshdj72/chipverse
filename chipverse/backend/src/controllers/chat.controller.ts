import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';
import { sendSuccess, sendError } from '../utils/response';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const convs = await chatService.getUserConversations(userId);
    return sendSuccess(res, convs);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const openDM = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { friendId } = req.body;
    if (!friendId) return sendError(res, 'friendId required', 400);
    const conv = await chatService.getOrCreateDM(userId, friendId);
    return sendSuccess(res, conv);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { name, memberIds } = req.body;
    if (!name || !Array.isArray(memberIds)) return sendError(res, 'name and memberIds required', 400);
    const conv = await chatService.createGroup(userId, name, memberIds);
    return sendSuccess(res, conv);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { conversationId } = req.params;
    const messages = await chatService.getMessages(conversationId, userId);
    return sendSuccess(res, messages);
  } catch (err: any) {
    return sendError(res, err.message, 403);
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const { conversationId } = req.params;
    const { newUserId } = req.body;
    if (!newUserId) return sendError(res, 'newUserId required', 400);
    const member = await chatService.addMemberToGroup(conversationId, userId, newUserId);
    return sendSuccess(res, member);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};