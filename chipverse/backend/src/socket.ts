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

    // Also join all existing conversation rooms at connect time
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
    // Called by frontend when user opens a conversation
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

        // ── KEY FIX ──────────────────────────────────────────────────────
        // Do NOT rely on conv room membership — emit directly to every
        // member's personal user:${userId} room instead.
        // This guarantees delivery even if the other user connected before
        // this conversation existed and never joined the conv room.
        const members = await prisma.conversationMember.findMany({
          where: { conversationId },
          select: { userId: true },
        });

        members.forEach(({ userId: memberId }) => {
          io.to(`user:${memberId}`).emit('receive_message', message);
        });
        // ─────────────────────────────────────────────────────────────────

      } catch (e) {
        logger.error('send_message error', e);
      }
    });

    // ── Chat: typing indicators ───────────────────────────────────────────
    // Emit to conv room for typing (minor feature, conv room miss is OK here)
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
// Used by notification service and chat service
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

// ─── Notify all members of a conversation to join its room ───────────────────
// Call this after creating a new DM or group so all members' sockets join
// the conv room immediately — fixes typing indicators for new conversations
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