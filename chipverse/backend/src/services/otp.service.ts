// OTP service — free implementation using nodemailer + Gmail
// No Twilio required. Uses in-memory store for OTP codes.
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// ─── In-memory OTP store (phone → { code, expiresAt }) ───────────────────────
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const OTP_TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 3;

// ─── Nodemailer transporter (Gmail free SMTP) ─────────────────────────────────
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      // Fallback: use Ethereal (test SMTP, no real emails sent)
      logger.warn('GMAIL_USER/GMAIL_APP_PASSWORD not set — OTPs will be logged to console only');
      return null;
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return transporter;
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────
// We accept phone but actually send via email since Twilio is paid
// The frontend sends phone — we look up the user's email from DB and send there
// If no email found, we fall back to logging the OTP (dev mode)
export const sendOtp = async (phone: string): Promise<void> => {
  const code = generateCode();
  otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

  const t = getTransporter();
  if (!t) {
    // Dev fallback — log OTP to console
    logger.info(`[DEV] OTP for ${phone}: ${code} (valid 5 mins)`);
    console.log(`\n🔐 OTP for ${phone}: ${code}\n`);
    return;
  }

  // Try to find user email from DB by phone
  const { default: prisma } = await import('../config/prisma');
  const user = await prisma.user.findFirst({
    where: { phone },
    select: { email: true, name: true },
  }).catch(() => null);

  if (user?.email) {
    await t.sendMail({
      from: `"ChipVerse" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: 'Your ChipVerse OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0a0a0f;border-radius:12px;color:#fff">
          <h2 style="color:#FF3C00;margin-bottom:8px">ChipVerse</h2>
          <p style="color:#aaa;margin-bottom:24px">Your one-time login code:</p>
          <div style="font-size:40px;font-weight:bold;letter-spacing:8px;color:#00f5ff;text-align:center;padding:16px;background:#1a1a2e;border-radius:8px;margin-bottom:24px">${code}</div>
          <p style="color:#aaa;font-size:13px">Valid for 5 minutes. Don't share this code with anyone.</p>
        </div>
      `,
    });
    logger.info(`OTP sent to email: ${user.email} for phone: ${phone}`);
  } else {
    // Phone not registered yet — log code for dev
    logger.info(`[DEV] OTP for unregistered ${phone}: ${code}`);
    console.log(`\n🔐 OTP for ${phone}: ${code}\n`);
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = async (phone: string, code: string): Promise<boolean> => {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { otpStore.delete(phone); return false; }

  entry.attempts += 1;
  if (entry.attempts > MAX_ATTEMPTS) { otpStore.delete(phone); return false; }
  if (entry.code !== code) return false;

  otpStore.delete(phone); // Single use
  return true;
};

// ─── Normalize phone ──────────────────────────────────────────────────────────
export const normalizePhone = (raw: string): string => {
  const cleaned = raw.replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) return `+91${cleaned}`;
  return cleaned;
};
