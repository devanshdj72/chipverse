import app from './app';
import { config } from './config/env';
import prisma from './config/prisma';
import logger from './utils/logger';

const start = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    const server = app.listen(config.port, () => {
      logger.info(`🚀 ChipVerse backend running on http://localhost:${config.port}`);
      logger.info(`   Environment: ${config.env}`);
      logger.info(`   Frontend URL: ${config.frontendUrl}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
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
