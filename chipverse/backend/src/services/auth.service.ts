import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AuthProvider } from '@prisma/client';
import logger from '../utils/logger';

const SALT_ROUNDS = 12;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterEmailInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginEmailInput {
  email: string;
  password: string;
}

export interface OAuthInput {
  provider: 'GOOGLE' | 'LINKEDIN';
  providerId: string;
  email?: string;
  name: string;
  avatarUrl?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createTokenPair = async (
  userId: string,
  email: string | null | undefined,
  role: string
): Promise<TokenPair> => {
  const payload = { userId, email: email ?? undefined, role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
  await prisma.refreshToken.create({
    data: { userId, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
};

const ensureProfile = async (userId: string): Promise<void> => {
  const existing = await prisma.userProfile.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.userProfile.create({ data: { userId } });
  }
};

// ─── Email / Password Auth ────────────────────────────────────────────────────

export const registerWithEmail = async (input: RegisterEmailInput) => {
  const { name, email, phone, password } = input;

  // Check existing
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('An account with this email already exists.');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      authProviders: {
        create: {
          provider: AuthProvider.EMAIL,
          providerId: email,
          accessToken: hashed,
        },
      },
    },
  });

  await ensureProfile(user.id);
  const tokens = await createTokenPair(user.id, user.email, user.role);

  logger.info(`New user registered via email: ${email}`);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginWithEmail = async (input: LoginEmailInput) => {
  const { email, password } = input;

  const user = await prisma.user.findFirst({
  where: { OR: [{ email }, { phone: email }] },
  include: { authProviders: { where: { provider: AuthProvider.EMAIL } } },
});

  if (!user) throw new Error('Invalid email or password.');

  const emailProvider = user.authProviders[0];
  if (!emailProvider?.accessToken) throw new Error('Invalid email or password.');

  const valid = await bcrypt.compare(password, emailProvider.accessToken);
  if (!valid) throw new Error('Invalid email or password.');

  if (!user.isActive) throw new Error('Account is deactivated. Contact support.');

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await ensureProfile(user.id);
  const tokens = await createTokenPair(user.id, user.email, user.role);

  logger.info(`User logged in via email: ${email}`);
  return { user: sanitizeUser(user), ...tokens };
};

// ─── OAuth (Google / LinkedIn) ────────────────────────────────────────────────

export const findOrCreateOAuthUser = async (input: OAuthInput) => {
  const { provider, providerId, email, name, avatarUrl } = input;

  // Check if auth provider record already exists
  const existingProvider = await prisma.userAuthProvider.findUnique({
    where: { provider_providerId: { provider: provider as AuthProvider, providerId } },
    include: { user: true },
  });

  if (existingProvider) {
    // Update tokens and return user
    await prisma.user.update({
      where: { id: existingProvider.userId },
      data: { lastLoginAt: new Date(), avatarUrl: avatarUrl ?? undefined },
    });
    await ensureProfile(existingProvider.userId);
    return existingProvider.user;
  }

  // Check if user with same email exists (link accounts)
  let user = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  if (user) {
    // Link this OAuth provider to existing account
    await prisma.userAuthProvider.create({
      data: {
        userId: user.id,
        provider: provider as AuthProvider,
        providerId,
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), avatarUrl: avatarUrl ?? user.avatarUrl },
    });
  } else {
    // New user via OAuth
    user = await prisma.user.create({
      data: {
        name,
        email: email ?? null,
        avatarUrl: avatarUrl ?? null,
        isEmailVerified: !!email, // trust OAuth email
        authProviders: {
          create: { provider: provider as AuthProvider, providerId },
        },
      },
    });
  }

  await ensureProfile(user.id);
  logger.info(`User authenticated via ${provider}: ${user.id}`);
  return user;
};

/** Called after passport OAuth to issue JWTs */
export const issueTokensForOAuthUser = async (userId: string, email: string | null, role: string) => {
  return createTokenPair(userId, email, role);
};

// ─── Phone / OTP Auth ────────────────────────────────────────────────────────

export const loginOrRegisterWithPhone = async (phone: string, name?: string) => {
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    // Auto-register if new
    user = await prisma.user.create({
      data: {
        name: name ?? 'ChipVerse User',
        phone,
        isPhoneVerified: true,
        authProviders: {
          create: { provider: AuthProvider.PHONE, providerId: phone },
        },
      },
    });
    await ensureProfile(user.id);
    logger.info(`New user registered via OTP: ${phone}`);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), isPhoneVerified: true },
    });
  }

  const tokens = await createTokenPair(user.id, user.email, user.role);
  return { user: sanitizeUser(user), ...tokens };
};

// ─── Token Refresh ────────────────────────────────────────────────────────────

export const refreshAccessToken = async (refreshToken: string) => {
  const record = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!record || record.isRevoked) throw new Error('Invalid refresh token.');
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.update({ where: { id: record.id }, data: { isRevoked: true } });
    throw new Error('Refresh token expired. Please login again.');
  }

  // Rotate refresh token (security best practice)
  await prisma.refreshToken.update({ where: { id: record.id }, data: { isRevoked: true } });

  const tokens = await createTokenPair(record.userId, record.user.email, record.user.role);
  return tokens;
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { isRevoked: true },
  });
};

// ─── Sanitize User (remove sensitive fields) ─────────────────────────────────

export const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  createdAt: user.createdAt,
});
