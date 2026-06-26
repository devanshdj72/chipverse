import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  otpSend,
  otpVerify,
  refresh,
  logoutHandler,
  getMe,
  googleCallback,
  linkedinCallback,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter, refreshLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// ─── Email / Password ─────────────────────────────────────────────────────────
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// ─── OTP / Phone ──────────────────────────────────────────────────────────────
router.post('/otp/send', otpLimiter, otpSend);
router.post('/otp/verify', authLimiter, otpVerify);

// ─── Token Management ─────────────────────────────────────────────────────────
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logoutHandler);

// ─── Current User ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, getMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        console.error('[Google OAuth Error]', err?.message || err);
        return res.redirect('https://devanshdj72.github.io/chipverse-pwa/?oauth_error=google_failed');
      }
      if (!user) {
        console.error('[Google OAuth No User]', info?.message || info || 'unknown');
        return res.redirect('https://devanshdj72.github.io/chipverse-pwa/?oauth_error=google_failed');
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

// ─── LinkedIn OAuth ───────────────────────────────────────────────────────────
router.get(
  '/linkedin',
  passport.authenticate('linkedin', { session: false })
);
router.get(
  '/linkedin/callback',
  (req, res, next) => {
    passport.authenticate('linkedin', { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        console.error('[LinkedIn OAuth Error]', err?.message || err);
        return res.redirect('https://devanshdj72.github.io/chipverse-pwa/?oauth_error=linkedin_failed');
      }
      if (!user) {
        console.error('[LinkedIn OAuth No User]', info?.message || info);
        return res.redirect('https://devanshdj72.github.io/chipverse-pwa/?oauth_error=linkedin_failed');
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  linkedinCallback
);

export default router;