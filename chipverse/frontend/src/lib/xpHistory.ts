const XP_HISTORY_KEY = 'chipverse_xp_history';
const ACTIVITY_KEY   = 'chipverse_streak_activity';

export type XPEntry = {
  id: string;
  amount: number;
  label: string;
  timestamp: number;
};

export const recordXPChange = (amount: number, label = 'XP Earned') => {
  try {
    const history = getXPHistory();
    const entry: XPEntry = { id: `${Date.now()}-${Math.random()}`, amount, label, timestamp: Date.now() };
    history.unshift(entry);
    localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));

    const today = new Date().toISOString().split('T')[0];
    const activity = getStreakActivity();
    activity[today] = (activity[today] || 0) + 1;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  } catch {}
};

export const getXPHistory = (): XPEntry[] => {
  try { const r = localStorage.getItem(XP_HISTORY_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
};

export const getStreakActivity = (): Record<string, number> => {
  try { const r = localStorage.getItem(ACTIVITY_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
};