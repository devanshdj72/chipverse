import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { config } from './env';
import { findOrCreateOAuthUser } from '../services/auth.service';
import logger from '../utils/logger';

// ─── Google OAuth Strategy (only if credentials are set) ─────────────────────
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: 'GOOGLE',
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          });
          return done(null, user);
        } catch (err) {
          logger.error('Google OAuth error', err);
          return done(err as Error);
        }
      }
    )
  );
  logger.info('✅ Google OAuth strategy registered');
} else {
  logger.warn('⚠️  Google OAuth skipped — GOOGLE_CLIENT_ID not set');
}

// ─── LinkedIn OAuth Strategy (only if credentials are set) ───────────────────
if (config.linkedin.clientId && config.linkedin.clientSecret) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: config.linkedin.clientId,
        clientSecret: config.linkedin.clientSecret,
        callbackURL: config.linkedin.callbackUrl,
        scope: ['r_emailaddress', 'r_liteprofile'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: 'LINKEDIN',
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          });
          return done(null, user);
        } catch (err) {
          logger.error('LinkedIn OAuth error', err);
          return done(err as Error);
        }
      }
    )
  );
  logger.info('✅ LinkedIn OAuth strategy registered');
} else {
  logger.warn('⚠️  LinkedIn OAuth skipped — LINKEDIN_CLIENT_ID not set');
}

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  done(null, { id });
});

export default passport;