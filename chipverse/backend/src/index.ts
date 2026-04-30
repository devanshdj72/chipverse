import http from 'http';
import app from './app';
import { config } from './config/env';
import prisma from './config/prisma';
import logger from './utils/logger';
import { initSocket } from './socket';

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // Initialize Socket.io on same HTTP server
    initSocket(httpServer);

    httpServer.listen(config.port, () => {
      logger.info(`🚀 ChipVerse backend running on http://localhost:${config.port}`);
      logger.info(`   Environment: ${config.env}`);
      logger.info(`   Frontend URL: ${config.frontendUrl}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      httpServer.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed. Goodbye!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();