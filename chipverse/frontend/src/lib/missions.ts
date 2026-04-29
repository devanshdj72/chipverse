export type Mission = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  target: number;
  type: "complete_levels" | "earn_xp" | "streak";
};

export const DAILY_MISSIONS: Mission[] = [
  {
    id: "daily_1",
    title: "Lab Starter",
    description: "Complete 1 lab today",
    icon: "🧪",
    xpReward: 50,
    target: 1,
    type: "complete_levels",
  },
  {
    id: "daily_2",
    title: "Double Down",
    description: "Complete 2 labs today",
    icon: "⚡",
    xpReward: 120,
    target: 2,
    type: "complete_levels",
  },
  {
    id: "daily_3",
    title: "XP Grinder",
    description: "Earn 200 XP today",
    icon: "💰",
    xpReward: 80,
    target: 200,
    type: "earn_xp",
  },
  {
    id: "daily_4",
    title: "On A Roll",
    description: "Maintain your streak",
    icon: "🔥",
    xpReward: 30,
    target: 1,
    type: "streak",
  },
];

// Get 3 random missions for today based on date seed
export const getTodaysMissions = (): Mission[] => {
  const today = new Date().toDateString();
  const seed = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...DAILY_MISSIONS].sort((a, b) => {
    const hashA = (seed * a.id.length) % 100;
    const hashB = (seed * b.id.length) % 100;
    return hashA - hashB;
  });
  return shuffled.slice(0, 3);
};