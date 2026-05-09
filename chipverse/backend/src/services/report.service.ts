import prisma from '../config/prisma';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SubLevelBreakdown {
  concept:     { completed: number; total: number };
  syntax:      { completed: number; total: number };
  walkthrough: { completed: number; total: number };
  lab:         { completed: number; total: number };
  quiz:        { completed: number; total: number };
}

export interface LevelDetail {
  levelId:             number;
  title:               string;
  status:              'completed' | 'in_progress' | 'not_started';
  xpEarned:            number;
  subLevelsCompleted:  number;
  totalSubLevels:      number;
  badge?:              string;
}

export interface ReportPayload {
  domainId:             string;
  domainName:           string;
  totalXpEarned:        number;
  levelsCompleted:      number;
  totalLevels:          number;
  subLevelsCompleted:   number;
  totalSubLevels:       number;
  completionPercentage: number;
  subLevelBreakdown:    SubLevelBreakdown;
  levelDetails:         LevelDetail[];
  badgesEarned:         string[];
  strengths:            string[];
  improvements:         string[];
}

// ── Generate / Update report ──────────────────────────────────────────────────
export const generateReport = async (userId: string, payload: ReportPayload) => {
  const { domainId } = payload;

  // Fetch user context from DB
  const user    = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, avatarUrl: true } });
  const profile = await prisma.userProfile.findUnique({ where: { userId }, select: { xp: true, streak: true, rank: true, battlesWon: true, battlesLost: true } });

  const fullReportData = {
    ...payload,
    userName:       user?.name    ?? 'Unknown',
    userAvatarUrl:  user?.avatarUrl ?? null,
    totalXp:        profile?.xp   ?? 0,
    streak:         profile?.streak ?? 0,
    globalRank:     profile?.rank ?? 'RTL Beginner',
    battlesWon:     profile?.battlesWon  ?? 0,
    battlesLost:    profile?.battlesLost ?? 0,
    generatedAt:    new Date().toISOString(),
  };

  // Upsert — create or update for this user+domain
  const report = await prisma.domainReport.upsert({
    where:  { userId_domainId: { userId, domainId } },
    update: { reportData: fullReportData as any, updatedAt: new Date() },
    create: { userId, domainId, reportData: fullReportData as any },
  });

  return report;
};

// ── Get user's own report ─────────────────────────────────────────────────────
export const getMyReport = async (userId: string, domainId: string) => {
  return prisma.domainReport.findUnique({
    where: { userId_domainId: { userId, domainId } },
  });
};

// ── Get public report by share token ─────────────────────────────────────────
export const getReportByToken = async (shareToken: string) => {
  return prisma.domainReport.findUnique({
    where: { shareToken },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });
};