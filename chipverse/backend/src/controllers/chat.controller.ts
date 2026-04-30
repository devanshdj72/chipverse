import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';
import { successResponse, errorResponse } from '../utils/response';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const convs = await chatService.getUserConversations(userId);
    return successResponse(res, convs);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

export const openDM = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { friendId } = req.body;
    if (!friendId) return errorResponse(res, 'friendId required', 400);
    const conv = await chatService.getOrCreateDM(userId, friendId);
    return successResponse(res, conv);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, memberIds } = req.body;
    if (!name || !Array.isArray(memberIds)) return errorResponse(res, 'name and memberIds required', 400);
    const conv = await chatService.createGroup(userId, name, memberIds);
    return successResponse(res, conv);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const messages = await chatService.getMessages(conversationId, userId);
    return successResponse(res, messages);
  } catch (err: any) {
    return errorResponse(res, err.message, 403);
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { newUserId } = req.body;
    if (!newUserId) return errorResponse(res, 'newUserId required', 400);
    const member = await chatService.addMemberToGroup(conversationId, userId, newUserId);
    return successResponse(res, member);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};