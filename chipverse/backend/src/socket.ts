import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from './utils/jwt';
import logger from './utils/logger';

// ─── Global socket instance ───────────────────────────────────────────────────
let io: SocketServer;

// Map userId → socketId for targeted notifications
const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
  origin: [
    'https://chipverse-q341.vercel.app',
    'https://chipverse-q341-git-v2-social-battle-devanshdj72s-projects.vercel.app',
    'https://chipverse-q341-git-v3-realtime-chat-devanshdj72s-projects.vercel.app',  // ← ADD THIS
    'https://chipverse-q341-pvhtnpzoh-devanshdj72s-projects.vercel.app',              // ← ADD THIS
    'http://localhost:5173',
    'http://localhost:4173',
  ],
  credentials: true,
},
    transports: ['websocket', 'polling'],
  });

  io.use((socket: Socket, next) => {
    // Authenticate socket connection via JWT token
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

    // Join personal room
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      userSocketMap.delete(userId);
      logger.info(`🔌 User disconnected: ${userId}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

// ─── Emit to a specific user ──────────────────────────────────────────────────
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

export const getIO = () => io;