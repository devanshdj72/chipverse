import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from './utils/jwt';
import { saveMessage } from './services/chat.service';
import prisma from './config/prisma';
import logger from './utils/logger';

let io: SocketServer;
const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: [
        'https://chipverse-q341.vercel.app',
        'https://chipverse-q341-git-v2-social-battle-devanshdj72s-projects.vercel.app',
        'http://localhost:5173',
        'http://localhost:4173',
      ],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    userSocketMap.set(userId, socket.id);
    logger.info(`🔌 User connected: ${userId}`);

    // Join personal notification room — always reliable
    socket.join(`user:${userId}`);

    // Auto-join all existing conversation rooms at connect time
    (async () => {
      try {
        const memberships = await prisma.conversationMember.findMany({
          where: { userId },
          select: { conversationId: true },
        });
        memberships.forEach((m) => socket.join(`conv:${m.conversationId}`));
      } catch (e) {
        logger.error('Failed to join conversation rooms on connect', e);
      }
    })();

    // ── Chat: explicitly join a conversation room ─────────────────────────
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    // ── Chat: send message ────────────────────────────────────────────────
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;
        if (!content?.trim()) return;

        // Verify sender is a member
        const member = await prisma.conversationMember.findUnique({
          where: { conversationId_userId: { conversationId, userId } },
        });
        if (!member) {
          logger.warn(`send_message: user ${userId} is not a member of ${conversationId}`);
          return;
        }

        // Save message to DB
        const message = await saveMessage(conversationId, userId, content.trim());

        // Fetch all members of this conversation
        const members = await prisma.conversationMember.findMany({
          where: { conversationId },
          select: { userId: true },
        });

        // ── KEY FIX ──────────────────────────────────────────────────────
        // Emit receive_message ONLY to OTHER members (not the sender).
        // The sender already has their message shown optimistically.
        // Emitting back to sender caused it to appear on BOTH sides.
        members.forEach(({ userId: memberId }) => {
          if (memberId === userId) return; // skip sender
          io.to(`user:${memberId}`).emit('receive_message', message);
        });

        // Send confirmation back to sender ONLY — used to replace the
        // optimistic temp message with the real saved message (correct id etc.)
        socket.emit('message_sent', message);
        // ─────────────────────────────────────────────────────────────────

      } catch (e) {
        logger.error('send_message error', e);
      }
    });

    // ── Chat: typing indicators ───────────────────────────────────────────
    socket.on('typing', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', { userId, conversationId });
    });

    socket.on('stop_typing', (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', { userId, conversationId });
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      userSocketMap.delete(userId);
      logger.info(`🔌 User disconnected: ${userId}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

// ─── Emit to a specific user's personal room ──────────────────────────────────
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

// ─── Notify all members of a new conversation to join its room ───────────────
export const notifyConversationCreated = async (conversationId: string) => {
  if (!io) return;
  try {
    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    members.forEach(({ userId }) => {
      io.to(`user:${userId}`).emit('conversation_created', { conversationId });
    });
  } catch (e) {
    logger.error('notifyConversationCreated error', e);
  }
};

export const getIO = () => io;