import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { getStreakActivity } from "@/lib/xpHistory";

const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_LBL = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Use local date string — avoids UTC timezone shift for IST users
const toLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Build 52-week grid for the year
function buildCalendar(year: number, activity: Record<string, number>) {
  const weeks: Array<Array<{ date: string; count: number; inYear: boolean }>> = [];
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const cur = new Date(jan1);
  cur.setDate(cur.getDate() - cur.getDay()); // rewind to Sunday
  while (cur <= dec31) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const ds = toLocalDate(cur);
      week.push({ date: ds, count: activity[ds] || 0, inYear: cur.getFullYear() === year });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// Place month label at the week containing the 1st of each month
function getMonthCols(year: number, weeks: ReturnType<typeof buildCalendar>) {
  const cols: { label: string; col: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = `${year}-${String(m + 1).padStart(2, "0")}-01`;
    const colIdx = weeks.findIndex(week => week.some(d => d.date === firstOfMonth));
    if (colIdx !== -1) cols.push({ label: MONTHS[m], col: colIdx });
  }
  return cols;
}

function cellColor(count: number) {
  if (count === 0) return "rgba(255,255,255,0.07)";
  if (count === 1) return "#ca8a04";
  if (count === 2) return "#4ade80";
  return "#16a34a";
}

interface Props { open: boolean; onClose: () => void; streak: number; }

export default function StreakCalendarModal({ open, onClose, streak }: Props) {
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { if (open) setActivity(getStreakActivity()); }, [open]);

  const weeks     = buildCalendar(year, activity);
  const monthCols = getMonthCols(year, weeks);
  const totalEvents = Object.entries(activity)
    .filter(([d]) => d.startsWith(String(year)))
    .reduce((s, [, c]) => s + c, 0);

  const CELL = 13, GAP = 3;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "900px",
              background: "rgba(8,8,20,0.99)",
              border: "1px solid rgba(251,146,60,0.35)",
              borderRadius: "22px", overflow: "hidden",
              boxShadow: "0 0 60px rgba(251,146,60,0.12), 0 30px 80px rgba(0,0,0,0.9)",
            }}
          >
            <div style={{ height: "3px", background: "linear-gradient(90deg,#fb923c,#f59e0b,#fb923c)" }} />

            <div style={{ padding: "22px 28px 26px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Flame style={{ width: "20px", height: "20px", color: "#fb923c" }} />
                  </div>
                  <div>
                    <div style={{ color: "#666", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "2px" }}>Day Streak</div>
                    <div style={{ color: "#fed7aa", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "22px" }}>{streak} days 🔥</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button onClick={() => setYear(y => y - 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft style={{ width: "13px", height: "13px" }} />
                  </button>
                  <span style={{ color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: "14px", fontWeight: 700, minWidth: "44px", textAlign: "center" }}>{year}</span>
                  <button onClick={() => setYear(y => y + 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight style={{ width: "13px", height: "13px" }} />
                  </button>
                  <button onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "4px" }}>
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "22px" }}>
                {[
                  { label: "Total Events",    value: totalEvents },
                  { label: "Current Streak",  value: `${streak}d` },
                  { label: "Active Months",   value: new Set(Object.keys(activity).filter(d => d.startsWith(String(year))).map(d => d.slice(0,7))).size },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                    <div style={{ color: "#fb923c", fontSize: "18px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{value}</div>
                    <div style={{ color: "#444", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginTop: "3px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Calendar */}
              <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
                {/* Month labels — correctly aligned */}
                <div style={{ display: "flex", marginLeft: "36px", marginBottom: "6px", position: "relative", height: "16px" }}>
                  {monthCols.map(({ label, col }) => (
                    <span key={label} style={{
                      position: "absolute",
                      left: `${col * (CELL + GAP)}px`,
                      color: "#888", fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      whiteSpace: "nowrap",
                    }}>{label}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "0" }}>
                  {/* Day labels */}
                  <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px`, marginRight: "10px", width: "32px", paddingTop: "1px" }}>
                    {DAYS_LBL.map((d, i) => (
                      <div key={i} style={{
                        height: `${CELL}px`, lineHeight: `${CELL}px`,
                        color: i === 0 || i === 6 ? "#fb923c" : "#777",
                        fontSize: "9.5px", fontFamily: "'DM Mono', monospace",
                        textAlign: "right", userSelect: "none", fontWeight: 600,
                        letterSpacing: "0.03em",
                      }}>{d}</div>
                    ))}
                  </div>

                  {/* Week columns */}
                  <div style={{ display: "flex", gap: `${GAP}px` }}>
                    {weeks.map((week, wi) => (
                      <div key={wi} style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
                        {week.map((day, di) => (
                          <div key={di}
                            title={day.inYear ? `${day.date} · ${day.count} event${day.count !== 1 ? "s" : ""}` : ""}
                            style={{
                              width: `${CELL}px`, height: `${CELL}px`,
                              borderRadius: "3px", flexShrink: 0,
                              background: day.inYear ? cellColor(day.count) : "transparent",
                              cursor: day.count > 0 ? "pointer" : "default",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
                <span style={{ color: "#555", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>Key</span>
                {[
                  { color: "rgba(255,255,255,0.07)", label: "No activity" },
                  { color: "#ca8a04",                label: "1 event" },
                  { color: "#4ade80",                label: "2 events" },
                  { color: "#16a34a",                label: "≥3 events" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: color, border: "1px solid rgba(255,255,255,0.08)" }} />
                    <span style={{ color: "#555", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>{label}</span>
                  </div>
                ))}
                <div style={{ marginLeft: "auto", color: "#555", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>
                  Total {year}: <strong style={{ color: "#fb923c" }}>{totalEvents}</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}