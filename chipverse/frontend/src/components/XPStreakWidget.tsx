import { useState, useEffect, useRef } from "react";
import { Flame, Zap, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { recordXPChange, getXPHistory, getStreakActivity, XPEntry } from "@/lib/xpHistory";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildCalendar(year: number, activity: Record<string, number>) {
  const weeks: Array<Array<{ date: string; count: number; inYear: boolean }>> = [];
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const cur = new Date(jan1);
  cur.setDate(cur.getDate() - cur.getDay()); // rewind to Sunday
  while (cur <= dec31) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const ds = cur.toISOString().split("T")[0];
      week.push({ date: ds, count: activity[ds] || 0, inYear: cur.getFullYear() === year });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getMonthCols(weeks: ReturnType<typeof buildCalendar>) {
  const cols: { label: string; col: number }[] = [];
  let last = -1;
  weeks.forEach((week, wi) => {
    const first = week.find((d) => d.inYear);
    if (!first) return;
    const m = new Date(first.date).getMonth();
    if (m !== last) { cols.push({ label: MONTHS[m], col: wi }); last = m; }
  });
  return cols;
}

function cellColor(count: number) {
  if (count === 0) return "rgba(255,255,255,0.06)";
  if (count === 1) return "#ca8a04";
  if (count === 2) return "#4ade80";
  return "#16a34a";
}

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export default function XPStreakWidget({ xp, streak }: { xp: number; streak: number }) {
  const [open, setOpen] = useState<"xp" | "streak" | null>(null);
  const [history, setHistory] = useState<XPEntry[]>([]);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const prevXp = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  // Auto-record XP changes
  useEffect(() => {
    if (prevXp.current !== 0 && xp !== prevXp.current) {
      recordXPChange(xp - prevXp.current);
    }
    prevXp.current = xp;
  }, [xp]);

  // Load on open
  useEffect(() => {
    if (open) { setHistory(getXPHistory()); setActivity(getStreakActivity()); }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (p: "xp" | "streak") => setOpen((o) => (o === p ? null : p));

  const weeks = buildCalendar(year, activity);
  const monthCols = getMonthCols(weeks);
  const totalEvents = Object.entries(activity)
    .filter(([d]) => d.startsWith(String(year)))
    .reduce((s, [, c]) => s + c, 0);
  const CELL = 10, GAP = 2, DAY_LABEL_W = 24;

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", gap: "6px", alignItems: "center" }}>

      {/* ── XP Pill ── */}
      <button onClick={() => toggle("xp")} style={{
        display: "flex", alignItems: "center", gap: "5px",
        background: open === "xp" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${open === "xp" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "999px", padding: "4px 12px", cursor: "pointer", transition: "all 0.2s",
        fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 700, color: "#c7d2fe",
      }}>
        <Zap style={{ width: "12px", height: "12px", color: "#818cf8" }} />
        {xp.toLocaleString()} XP
      </button>

      {/* ── Streak Pill ── */}
      <button onClick={() => toggle("streak")} style={{
        display: "flex", alignItems: "center", gap: "5px",
        background: open === "streak" ? "rgba(251,146,60,0.2)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${open === "streak" ? "rgba(251,146,60,0.5)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "999px", padding: "4px 12px", cursor: "pointer", transition: "all 0.2s",
        fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 700, color: "#fed7aa",
      }}>
        <Flame style={{ width: "12px", height: "12px", color: "#fb923c" }} />
        {streak}
      </button>

      {/* ── XP Dropdown ── */}
      {open === "xp" && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0, width: "300px",
          background: "rgba(8,8,20,0.98)", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", zIndex: 9999, overflow: "hidden",
        }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ color: "#666", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Total XP</div>
                <div style={{ color: "#c7d2fe", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "22px" }}>{xp.toLocaleString()}</div>
              </div>
              <Zap style={{ width: "28px", height: "28px", color: "#6366f1" }} />
            </div>
            <div style={{ color: "#444", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Recent Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "230px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#222 transparent" }}>
              {history.length === 0
                ? <div style={{ color: "#333", fontSize: "11px", fontFamily: "'DM Mono', monospace", textAlign: "center", padding: "24px 0" }}>No XP history yet</div>
                : history.map((e) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      {e.amount > 0
                        ? <TrendingUp style={{ width: "12px", height: "12px", color: "#4ade80" }} />
                        : <TrendingDown style={{ width: "12px", height: "12px", color: "#f87171" }} />}
                      <span style={{ color: "#bbb", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{e.label}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: e.amount > 0 ? "#4ade80" : "#f87171", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                        {e.amount > 0 ? "+" : ""}{e.amount} XP
                      </div>
                      <div style={{ color: "#333", fontSize: "9px", fontFamily: "'DM Mono', monospace" }}>{timeAgo(e.timestamp)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Streak Calendar Dropdown ── */}
      {open === "streak" && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: `${DAY_LABEL_W + weeks.length * (CELL + GAP) + 32}px`,
          minWidth: "500px", maxWidth: "98vw",
          background: "rgba(8,8,20,0.98)", border: "1px solid rgba(251,146,60,0.3)",
          borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", zIndex: 9999, overflow: "hidden",
        }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg,#fb923c,#f59e0b)" }} />
          <div style={{ padding: "16px 18px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Flame style={{ width: "16px", height: "16px", color: "#fb923c" }} />
                <span style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "13px" }}>Yearly Activity</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#666", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>
                  Total: <strong style={{ color: "#fb923c" }}>{totalEvents}</strong>
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button onClick={() => setYear((y) => y - 1)} style={{ width: "22px", height: "22px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft style={{ width: "11px", height: "11px" }} />
                  </button>
                  <span style={{ color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: 700, minWidth: "36px", textAlign: "center" }}>{year}</span>
                  <button onClick={() => setYear((y) => y + 1)} style={{ width: "22px", height: "22px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight style={{ width: "11px", height: "11px" }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Month labels */}
            <div style={{ position: "relative", marginLeft: `${DAY_LABEL_W + 4}px`, height: "14px", marginBottom: "3px" }}>
              {monthCols.map(({ label, col }) => (
                <span key={label} style={{
                  position: "absolute", left: `${col * (CELL + GAP)}px`,
                  color: "#555", fontSize: "9px", fontFamily: "'DM Mono', monospace",
                  whiteSpace: "nowrap",
                }}>{label}</span>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: "flex", gap: "0px" }}>
              {/* Day labels */}
              <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px`, marginRight: "4px", width: `${DAY_LABEL_W}px` }}>
                {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                  <div key={i} style={{ height: `${CELL}px`, lineHeight: `${CELL}px`, color: "#444", fontSize: "8px", fontFamily: "'DM Mono', monospace", textAlign: "right" }}>{d}</div>
                ))}
              </div>
              {/* Weeks */}
              <div style={{ display: "flex", gap: `${GAP}px` }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
                    {week.map((day, di) => (
                      <div key={di} title={day.inYear ? `${day.date}: ${day.count} event${day.count !== 1 ? "s" : ""}` : ""} style={{
                        width: `${CELL}px`, height: `${CELL}px`, borderRadius: "2px",
                        background: day.inYear ? cellColor(day.count) : "transparent",
                        cursor: day.count > 0 ? "pointer" : "default",
                        flexShrink: 0,
                      }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend + streak */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "#444", fontSize: "9px", fontFamily: "'DM Mono', monospace" }}>Key</span>
              {[
                { color: "rgba(255,255,255,0.06)", label: "No activity" },
                { color: "#ca8a04", label: "1 event" },
                { color: "#4ade80", label: "2 events" },
                { color: "#16a34a", label: "≥3 events" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: color, border: "1px solid rgba(255,255,255,0.08)" }} />
                  <span style={{ color: "#444", fontSize: "9px", fontFamily: "'DM Mono', monospace" }}>{label}</span>
                </div>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}>
                <Flame style={{ width: "12px", height: "12px", color: "#fb923c" }} />
                <span style={{ color: "#fb923c", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: 700 }}>{streak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
