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
export const updateUserProfile = async (
  userId: string,
  data: { name?: string; bio?: string; avatarUrl?: string }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
    },
  });

  if (data.bio !== undefined) {
    await prisma.userProfile.update({
      where: { userId },
      data: { bio: data.bio } as any,
    });
  }

  return user;
};
export const getLeaderboard = async (limit = 20) => {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  const progress = await prisma.domainProgress.findMany({
    where: { userId: { in: profiles.map(p => p.userId) } },
  });

  return profiles.map((profile, index) => {
    const userProgress = progress.filter(p => p.userId === profile.userId);
    const topDomain = userProgress.sort((a, b) => b.completedLevels.length - a.completedLevels.length)[0];

    return {
      rank: index + 1,
      userId: profile.userId,
      name: profile.user.name,
      avatarUrl: profile.user.avatarUrl,
      xp: profile.xp,
      streak: profile.streak,
      rank_title: profile.rank,
      currentDomain: profile.currentDomain,
      topDomain: topDomain?.domainId ?? profile.currentDomain,
      totalLevelsCompleted: userProgress.reduce((s, p) => s + p.completedLevels.length, 0),
    };
  });
};

export const getSiteStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalLevelsCompleted = await prisma.domainProgress.findMany();
  const totalXp = await prisma.userProfile.aggregate({ _sum: { xp: true } });

  return {
    totalUsers,
    totalLevelsCompleted: totalLevelsCompleted.reduce((s, p) => s + p.completedLevels.length, 0),
    totalXp: totalXp._sum.xp ?? 0,
  };
};
