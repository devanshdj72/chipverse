import twilio from 'twilio';
import { config } from '../config/env';
import logger from '../utils/logger';

let client: ReturnType<typeof twilio> | null = null;

const getClient = () => {
  if (!client) {
    if (!config.twilio.accountSid || !config.twilio.authToken) {
      throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }
    client = twilio(config.twilio.accountSid, config.twilio.authToken);
  }
  return client;
};

/**
 * Send OTP to a phone number using Twilio Verify
 * @param phone - E.164 format e.g. +919876543210
 */
export const sendOtp = async (phone: string): Promise<void> => {
  if (!config.twilio.verifyServiceSid) {
    throw new Error('Twilio Verify Service SID not configured. Set TWILIO_VERIFY_SERVICE_SID in .env');
  }

  try {
    const verification = await getClient().verify.v2
      .services(config.twilio.verifyServiceSid)
      .verifications.create({ to: phone, channel: 'sms' });

    logger.info(`OTP sent to ${phone}, status: ${verification.status}`);
  } catch (err: any) {
    logger.error(`Failed to send OTP to ${phone}:`, err.message);
    throw new Error(`Failed to send OTP: ${err.message}`);
  }
};

/**
 * Verify OTP entered by user
 * @param phone - E.164 format
 * @param code - 6-digit OTP
 * @returns true if valid, false if invalid/expired
 */
export const verifyOtp = async (phone: string, code: string): Promise<boolean> => {
  if (!config.twilio.verifyServiceSid) {
    throw new Error('Twilio Verify Service SID not configured.');
  }

  try {
    const result = await getClient().verify.v2
      .services(config.twilio.verifyServiceSid)
      .verificationChecks.create({ to: phone, code });

    logger.info(`OTP verification for ${phone}: ${result.status}`);
    return result.status === 'approved';
  } catch (err: any) {
    logger.error(`OTP verification failed for ${phone}:`, err.message);
    return false;
  }
};

/**
 * Normalize phone number to E.164 (adds +91 if Indian 10-digit number)
 */
export const normalizePhone = (raw: string): string => {
  const cleaned = raw.replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  // Assume India (+91) for 10-digit numbers
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) return `+91${cleaned}`;
  return cleaned;
};
