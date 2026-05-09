import prisma, { Prisma } from '../config/prisma';
import { PRESET_AVATARS, CustomAvatarConfig, CUSTOM_AVATAR_OPTIONS } from '../data/avatars.data';

// ── GET ALL PRESET AVATARS ────────────────────────────────────────────────────
export const getAllPresetAvatars = () => {
  return {
    avatars: PRESET_AVATARS,
    options: CUSTOM_AVATAR_OPTIONS,
    total: PRESET_AVATARS.length,
    breakdown: {
      anime:  PRESET_AVATARS.filter(a => a.category === 'anime').length,
      marvel: PRESET_AVATARS.filter(a => a.category === 'marvel').length,
      dc:     PRESET_AVATARS.filter(a => a.category === 'dc').length,
    },
  };
};

// ── SAVE PRESET AVATAR SELECTION ─────────────────────────────────────────────
export const savePresetAvatar = async (userId: string, avatarId: string) => {
  const avatar = PRESET_AVATARS.find(a => a.id === avatarId);
  if (!avatar) throw new Error('Invalid avatar ID');

  return prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl:    avatar.imagePath,
      avatarConfig: Prisma.DbNull, // clear custom config when preset is chosen
    },
    select: { id: true, name: true, avatarUrl: true },
  });
};

// ── SAVE CUSTOM AVATAR CONFIG ─────────────────────────────────────────────────
export const saveCustomAvatar = async (userId: string, config: CustomAvatarConfig) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl:    null,   // clear preset when custom is chosen
      avatarConfig: config as any,
    },
    select: { id: true, name: true, avatarUrl: true, avatarConfig: true },
  });
};

// ── GET USER'S CUSTOM AVATAR CONFIG ──────────────────────────────────────────
export const getCustomAvatarConfig = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { avatarUrl: true, avatarConfig: true },
  });
  if (!user) throw new Error('User not found');
  return user;
};