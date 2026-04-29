export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: "progress" | "streak" | "speed" | "mastery" | "special";
  condition: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  totalCompleted: number;
  totalXp: number;
  streak: number;
  domainsStarted: number;
  domainsCompleted: number;
  firstLevelTime?: number; // ms taken for first level
};

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Progress ───────────────────────────────────────────────────────────────
  {
    id: "first_blood",
    title: "First Blood",
    description: "Complete your very first level",
    icon: "🩸",
    xpReward: 50,
    category: "progress",
    condition: (s) => s.totalCompleted >= 1,
  },
  {
    id: "getting_started",
    title: "Getting Started",
    description: "Complete 5 levels",
    icon: "🚀",
    xpReward: 100,
    category: "progress",
    condition: (s) => s.totalCompleted >= 5,
  },
  {
    id: "momentum",
    title: "Momentum",
    description: "Complete 10 levels",
    icon: "⚡",
    xpReward: 200,
    category: "progress",
    condition: (s) => s.totalCompleted >= 10,
  },
  {
    id: "halfway_there",
    title: "Halfway There",
    description: "Complete 25 levels",
    icon: "🎯",
    xpReward: 400,
    category: "progress",
    condition: (s) => s.totalCompleted >= 25,
  },
  {
    id: "level_legend",
    title: "Level Legend",
    description: "Complete 50 levels",
    icon: "🏆",
    xpReward: 1000,
    category: "progress",
    condition: (s) => s.totalCompleted >= 50,
  },

  // ─── Streak ─────────────────────────────────────────────────────────────────
  {
    id: "on_fire",
    title: "On Fire",
    description: "Maintain a 3 day streak",
    icon: "🔥",
    xpReward: 75,
    category: "streak",
    condition: (s) => s.streak >= 3,
  },
  {
    id: "week_warrior",
    title: "Week Warrior",
    description: "Maintain a 7 day streak",
    icon: "📅",
    xpReward: 200,
    category: "streak",
    condition: (s) => s.streak >= 7,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Maintain a 14 day streak",
    icon: "💪",
    xpReward: 500,
    category: "streak",
    condition: (s) => s.streak >= 14,
  },
  {
    id: "streak_god",
    title: "Streak God",
    description: "Maintain a 30 day streak",
    icon: "👑",
    xpReward: 1500,
    category: "streak",
    condition: (s) => s.streak >= 30,
  },

  // ─── Mastery ─────────────────────────────────────────────────────────────────
  {
    id: "domain_explorer",
    title: "Domain Explorer",
    description: "Start learning in 3 different domains",
    icon: "🗺️",
    xpReward: 150,
    category: "mastery",
    condition: (s) => s.domainsStarted >= 3,
  },
  {
    id: "domain_master",
    title: "Domain Master",
    description: "Complete all levels in any domain",
    icon: "🎓",
    xpReward: 800,
    category: "mastery",
    condition: (s) => s.domainsCompleted >= 1,
  },
  {
    id: "polymath",
    title: "Polymath",
    description: "Complete all levels in 3 domains",
    icon: "🧠",
    xpReward: 2000,
    category: "mastery",
    condition: (s) => s.domainsCompleted >= 3,
  },
  {
    id: "chip_architect",
    title: "Chip Architect",
    description: "Complete all levels in all domains",
    icon: "💎",
    xpReward: 5000,
    category: "mastery",
    condition: (s) => s.domainsCompleted >= 8,
  },

  // ─── XP ─────────────────────────────────────────────────────────────────────
  {
    id: "xp_hunter",
    title: "XP Hunter",
    description: "Earn 500 total XP",
    icon: "✨",
    xpReward: 100,
    category: "special",
    condition: (s) => s.totalXp >= 500,
  },
  {
    id: "xp_machine",
    title: "XP Machine",
    description: "Earn 2000 total XP",
    icon: "⚙️",
    xpReward: 300,
    category: "special",
    condition: (s) => s.totalXp >= 2000,
  },
  {
    id: "xp_legend",
    title: "XP Legend",
    description: "Earn 5000 total XP",
    icon: "🌟",
    xpReward: 1000,
    category: "special",
    condition: (s) => s.totalXp >= 5000,
  },

  // ─── Special ─────────────────────────────────────────────────────────────────
  {
    id: "perfect_score",
    title: "Perfect Score",
    description: "Get all questions right in a lab quiz",
    icon: "💯",
    xpReward: 200,
    category: "special",
    condition: (s) => s.totalCompleted >= 1,
  },
  {
    id: "speed_runner",
    title: "Speed Runner",
    description: "Complete 3 levels in one day",
    icon: "⚡",
    xpReward: 300,
    category: "speed",
    condition: (s) => s.totalCompleted >= 3,
  },
];

export const getUnlockedAchievements = (stats: AchievementStats): Achievement[] =>
  ACHIEVEMENTS.filter((a) => a.condition(stats));

export const getLockedAchievements = (stats: AchievementStats): Achievement[] =>
  ACHIEVEMENTS.filter((a) => !a.condition(stats));