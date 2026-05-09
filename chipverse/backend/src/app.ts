import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import reportRoutes from './routes/report.routes';

import { config } from './config/env';
import './config/passport';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import friendsRoutes from './routes/friends.routes';
import battleRoutes from './routes/battle.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';
import placementRoutes from './routes/placement.routes';
import labRoutes from './routes/lab.routes';
import adminRoutes from './routes/admin.routes';
import resourceRoutes from './routes/resource.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import logger from './utils/logger';
import avatarRoutes from './routes/avatar.routes';

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed =
    !origin ||
    origin === 'https://chipverse-q341.vercel.app' ||
    /^https:\/\/chipverse-q341-.*\.vercel\.app$/.test(origin) ||
    /^https:\/\/chipverse-q341-.*-devanshdj72s-projects\.vercel\.app$/.test(origin) ||
    origin === 'http://localhost:5173' ||
    origin === 'http://localhost:4173';
  if (isAllowed) res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return next();
});

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookie.secret));
app.use(morgan(config.isDev ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

app.use('/api', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.env });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/user/avatar', avatarRoutes);

// ── Error handlers (must be LAST) ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;