import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

const optional = (key: string, fallback = ''): string =>
  process.env[key] ?? fallback;

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),

  db: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    accessSecret: required('JWT_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  google: {
    clientId: optional('GOOGLE_CLIENT_ID'),
    clientSecret: optional('GOOGLE_CLIENT_SECRET'),
    callbackUrl: optional('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/auth/google/callback'),
  },

  linkedin: {
    clientId: optional('LINKEDIN_CLIENT_ID'),
    clientSecret: optional('LINKEDIN_CLIENT_SECRET'),
    callbackUrl: optional('LINKEDIN_CALLBACK_URL', 'http://localhost:5000/api/auth/linkedin/callback'),
  },

  twilio: {
    accountSid: optional('TWILIO_ACCOUNT_SID'),
    authToken: optional('TWILIO_AUTH_TOKEN'),
    verifyServiceSid: optional('TWILIO_VERIFY_SERVICE_SID'),
  },

  cookie: {
    secret: optional('COOKIE_SECRET', 'chipverse-cookie-secret'),
  },

  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',

  adminSecretKey: optional('ADMIN_SECRET_KEY', 'chipverse_admin_secret_2024'),
};