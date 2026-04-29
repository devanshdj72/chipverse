import winston from 'winston';
import { config } from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`
  )
);

const prodFormat = combine(timestamp(), errors({ stack: true }), winston.format.json());

// Only Console transport — no file system (Vercel serverless can't create folders)
const logger = winston.createLogger({
  level: config.isDev ? 'debug' : 'info',
  format: config.isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});

export default logger;