import { useState, useEffect, useCallback } from "react";
import { Achievement, AchievementStats, getUnlockedAchievements, ACHIEVEMENTS } from "./achievements";
import { getTodaysMissions, Mission } from "./missions";

const STORAGE_KEY = "chipverse_achievements";
const MISSIONS_KEY = "chipverse_missions";

export function useGamification(stats: AchievementStats) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
    catch { return []; }
  });

  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const [missionProgress, setMissionProgress] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(MISSIONS_KEY) ?? "{}"); }
    catch { return {}; }
  });

  const todaysMissions = getTodaysMissions();

  // Check for new achievements
  useEffect(() => {
    const currentUnlocked = getUnlockedAchievements(stats);
    const newlyUnlocked = currentUnlocked.filter(a => !unlockedIds.includes(a.id));

    if (newlyUnlocked.length > 0) {
      const first = newlyUnlocked[0];
      setNewAchievement(first);
      const updated = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
      setUnlockedIds(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [stats.totalCompleted, stats.streak, stats.totalXp, stats.domainsCompleted]);

  const updateMissionProgress = useCallback((type: string, amount: number) => {
    setMissionProgress(prev => {
      const today = new Date().toDateString();
      const key = `${today}_${type}`;
      const updated = { ...prev, [key]: (prev[key] ?? 0) + amount };
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getMissionProgress = useCallback((mission: Mission): number => {
    const today = new Date().toDateString();
    const key = `${today}_${mission.type}`;
    return missionProgress[key] ?? 0;
  }, [missionProgress]);

  const streakMultiplier = stats.streak >= 7 ? 2 :
    stats.streak >= 3 ? 1.5 : 1;

  return {
    unlockedIds,
    newAchievement,
    clearNewAchievement: () => setNewAchievement(null),
    todaysMissions,
    getMissionProgress,
    updateMissionProgress,
    streakMultiplier,
    totalAchievements: ACHIEVEMENTS.length,
    unlockedCount: unlockedIds.length,
  };
}