import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

let socket: Socket | null = null;

export const connectSocket = (accessToken: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// ── Chat helpers ──────────────────────────────────────────────────────────────

export const joinConversation = (conversationId: string) => {
  socket?.emit('join_conversation', conversationId);
};

export const sendSocketMessage = (conversationId: string, content: string) => {
  socket?.emit('send_message', { conversationId, content });
};

export const emitTyping = (conversationId: string) => {
  socket?.emit('typing', conversationId);
};

export const emitStopTyping = (conversationId: string) => {
  socket?.emit('stop_typing', conversationId);
};