import { useState, useEffect, useRef } from "react";
import { Flame, Zap, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { recordXPChange, getXPHistory, getStreakActivity, XPEntry } from "@/lib/xpHistory";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildMonthGrid(year: number, month: number, activity: Record<string, number>) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; day: number; count: number } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, day: d, count: activity[date] || 0 });
  }
  return cells;
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
  const now = new Date();
  const [open, setOpen]       = useState<"xp" | "streak" | null>(null);
  const [history, setHistory] = useState<XPEntry[]>([]);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const prevXp = useRef(0);
  const ref    = useRef<HTMLDivElement>(null);

  // Auto-record XP changes
  useEffect(() => {
    if (prevXp.current !== 0 && xp !== prevXp.current)
      recordXPChange(xp - prevXp.current);
    prevXp.current = xp;
  }, [xp]);

  // Load data on open
  useEffect(() => {
    if (open) { setHistory(getXPHistory()); setActivity(getStreakActivity()); }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (p: "xp" | "streak") => setOpen((o) => (o === p ? null : p));

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const cells = buildMonthGrid(calYear, calMonth, activity);
  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  while (rows[rows.length - 1]?.length < 7)
    rows[rows.length - 1].push(null);

  const monthTotal = Object.entries(activity)
    .filter(([d]) => d.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, "0")}`))
    .reduce((s, [, c]) => s + c, 0);

  const isToday = (date: string) => date === now.toISOString().split("T")[0];

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", gap: "6px", alignItems: "center" }}>

      {/* XP Pill */}
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

      {/* Streak Pill */}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {(() => {
                const preview = history.slice(0, 2);
                if (preview.length === 0) return (
                  <div style={{ color: "#333", fontSize: "11px", fontFamily: "'DM Mono', monospace", textAlign: "center", padding: "20px 0" }}>No XP history yet</div>
                );
                return preview.map((e) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "9px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      {e.amount > 0
                        ? <TrendingUp  style={{ width: "12px", height: "12px", color: "#4ade80" }} />
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
                ));
              })()}
            </div>

          </div>
        </div>
      )}

      {/* ── Streak Calendar Dropdown (monthly) ── */}
      {open === "streak" && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0, width: "300px",
          background: "rgba(8,8,20,0.98)", border: "1px solid rgba(251,146,60,0.3)",
          borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", zIndex: 9999, overflow: "hidden",
        }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg,#fb923c,#f59e0b)" }} />
          <div style={{ padding: "14px 16px" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <Flame style={{ width: "15px", height: "15px", color: "#fb923c" }} />
                <span style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "12px" }}>
                  {MONTHS[calMonth]} {calYear}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#666", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginRight: "6px" }}>
                  {monthTotal} event{monthTotal !== 1 ? "s" : ""}
                </span>
                <button onClick={prevMonth} style={{ width: "22px", height: "22px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft style={{ width: "11px", height: "11px" }} />
                </button>
                <button onClick={nextMonth} style={{ width: "22px", height: "22px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight style={{ width: "11px", height: "11px" }} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginBottom: "4px" }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: "center", color: "#444", fontSize: "8px", fontFamily: "'DM Mono', monospace", padding: "2px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {rows.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                  {row.map((cell, ci) => (
                    <div key={ci} title={cell ? `${cell.date}: ${cell.count} event${cell.count !== 1 ? "s" : ""}` : ""}
                      style={{
                        aspectRatio: "1", borderRadius: "5px",
                        background: cell ? cellColor(cell.count) : "transparent",
                        border: cell && isToday(cell.date) ? "1.5px solid #fb923c" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "8px", fontFamily: "'DM Mono', monospace",
                        color: cell ? (cell.count > 0 ? "#000" : "#555") : "transparent",
                        fontWeight: 700,
                        cursor: cell && cell.count > 0 ? "pointer" : "default",
                        transition: "transform 0.1s",
                        boxSizing: "border-box",
                      }}>
                      {cell?.day ?? ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend + streak */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {[
                  { color: "rgba(255,255,255,0.06)", label: "0" },
                  { color: "#ca8a04",                label: "1" },
                  { color: "#4ade80",                label: "2" },
                  { color: "#16a34a",                label: "3+" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
                    <span style={{ color: "#444", fontSize: "8px", fontFamily: "'DM Mono', monospace" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Flame style={{ width: "11px", height: "11px", color: "#fb923c" }} />
                <span style={{ color: "#fb923c", fontFamily: "'DM Mono', monospace", fontSize: "10px", fontWeight: 700 }}>{streak}d streak</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}