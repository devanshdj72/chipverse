import prisma from '../config/prisma';

export const getUserProfile = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const progress = await prisma.domainProgress.findMany({ where: { userId } });

  return { profile, progress };
};

export const updateProgress = async (
  userId: string,
  domainId: string,
  levelId: number,
  xpGained: number
) => {
  // Upsert domain progress
  const existing = await prisma.domainProgress.findUnique({
    where: { userId_domainId: { userId, domainId } },
  });

  let completedLevels = existing?.completedLevels ?? [];

  if (!completedLevels.includes(levelId)) {
    completedLevels = [...completedLevels, levelId];

    await prisma.domainProgress.upsert({
      where: { userId_domainId: { userId, domainId } },
      update: { completedLevels },
      create: { userId, domainId, completedLevels },
    });

    // Add XP to profile
    await prisma.userProfile.updateMany({
      where: { userId },
      data: { xp: { increment: xpGained }, lastActiveAt: new Date() },
    });
  }

  return await getUserProfile(userId);
};

export const setCurrentDomain = async (userId: string, domainId: string) => {
  return prisma.userProfile.update({
    where: { userId },
    data: { currentDomain: domainId },
  });
};

export const updateStreak = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const lastActive = profile.lastActiveAt;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = profile.streak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1; // reset
  }

  return prisma.userProfile.update({
    where: { userId },
    data: { streak: newStreak, lastActiveAt: now },
  });
};
