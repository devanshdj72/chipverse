const XP_HISTORY_KEY = 'chipverse_xp_history';
const ACTIVITY_KEY   = 'chipverse_streak_activity';
const MISSIONS_KEY   = 'chipverse_missions';

export type XPEntry = {
  id: string;
  amount: number;
  label: string;
  timestamp: number;
};

// ── Use LOCAL date string (not UTC) to avoid timezone shift ──────────────────
const toLocalDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ── Write mission progress directly to localStorage (same key as useGamification) ──
const updateMissionLocal = (type: string, amount: number) => {
  try {
    const today = new Date().toDateString();
    const key   = `${today}_${type}`;
    const raw   = localStorage.getItem(MISSIONS_KEY);
    const data  = raw ? JSON.parse(raw) : {};
    data[key]   = (data[key] ?? 0) + amount;
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(data));
  } catch {}
};

export const recordXPChange = (amount: number, label = 'XP Earned') => {
  try {
    const history = getXPHistory();
    const entry: XPEntry = { id: `${Date.now()}-${Math.random()}`, amount, label, timestamp: Date.now() };
    history.unshift(entry);
    localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));

    // Track streak activity
    const today = toLocalDate();
    const activity = getStreakActivity();
    activity[today] = (activity[today] || 0) + 1;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));

    // ── Auto-update mission progress ──────────────────────────────────────
    if (amount > 0) {
      updateMissionLocal('earn_xp', amount);        // XP Grinder mission
      updateMissionLocal('complete_levels', 1);     // Lab Starter / Double Down (1 sublevel = 1 XP event)
    }
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