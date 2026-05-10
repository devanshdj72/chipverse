import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Zap, Search } from "lucide-react";
import { getXPHistory, XPEntry } from "@/lib/xpHistory";

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  if (d < 604800000) return `${Math.floor(d / 86400000)}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type Filter = "all" | "gain" | "loss";

interface Props {
  open: boolean;
  onClose: () => void;
  totalXp: number;
}

export default function XPHistoryModal({ open, onClose, totalXp }: Props) {
  const [history, setHistory] = useState<XPEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setHistory(getXPHistory());
  }, [open]);

  const filtered = history.filter((e) => {
    if (filter === "gain" && e.amount <= 0) return false;
    if (filter === "loss" && e.amount >= 0) return false;
    if (search && !e.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalGained = history.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalLost   = history.filter(e => e.amount < 0).reduce((s, e) => s + e.amount, 0);

  // Group by date
  const grouped: { date: string; entries: XPEntry[] }[] = [];
  filtered.forEach((e) => {
    const date = formatDate(e.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.entries.push(e);
    else grouped.push({ date, entries: [e] });
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vw,40px)", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "560px",
              maxHeight: "calc(100vh - clamp(24px,4vw,80px))",
              background: "rgba(8,8,20,0.99)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "22px", overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: "0 0 60px rgba(99,102,241,0.15), 0 30px 80px rgba(0,0,0,0.9)",
            }}
          >
            {/* Accent bar */}
            <div style={{ height: "3px", background: "linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)", flexShrink: 0 }} />

            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap style={{ width: "18px", height: "18px", color: "#818cf8" }} />
                  </div>
                  <div>
                    <div style={{ color: "#666", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>XP History</div>
                    <div style={{ color: "#c7d2fe", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "20px" }}>{totalXp.toLocaleString()} XP</div>
                  </div>
                </div>
                <button onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "14px", height: "14px" }} />
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                {[
                  { label: "Total Entries", value: history.length, color: "#c7d2fe" },
                  { label: "Total Gained",  value: `+${totalGained.toLocaleString()}`, color: "#4ade80" },
                  { label: "Total Lost",    value: totalLost === 0 ? "0" : `${totalLost.toLocaleString()}`, color: totalLost < 0 ? "#f87171" : "#666" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ color, fontSize: "14px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{value}</div>
                    <div style={{ color: "#444", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", color: "#444" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search activity..."
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "8px 10px 8px 30px", color: "#ccc", fontSize: "12px", fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: "6px" }}>
                {(["all", "gain", "loss"] as Filter[]).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "5px 14px", borderRadius: "999px", fontSize: "10px",
                    fontFamily: "'DM Mono', monospace", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    background: filter === f ? (f === "gain" ? "rgba(74,222,128,0.15)" : f === "loss" ? "rgba(248,113,113,0.15)" : "rgba(99,102,241,0.2)") : "rgba(255,255,255,0.04)",
                    border: `1px solid ${filter === f ? (f === "gain" ? "rgba(74,222,128,0.4)" : f === "loss" ? "rgba(248,113,113,0.4)" : "rgba(99,102,241,0.4)") : "rgba(255,255,255,0.08)"}`,
                    color: filter === f ? (f === "gain" ? "#4ade80" : f === "loss" ? "#f87171" : "#a5b4fc") : "#555",
                  }}>
                    {f === "all" ? "All" : f === "gain" ? "✦ Gains" : "▾ Losses"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px 20px", scrollbarWidth: "thin", scrollbarColor: "#222 transparent" }}>
              {grouped.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#333", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
                  {history.length === 0 ? "No XP history yet.\nComplete a sublevel to start tracking!" : "No results match your filter."}
                </div>
              ) : (
                grouped.map(({ date, entries }) => (
                  <div key={date} style={{ marginBottom: "16px" }}>
                    {/* Date header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.06)" }} />
                      <span style={{ color: "#444", fontSize: "9px", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{date}</span>
                      <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.06)" }} />
                    </div>

                    {/* Entries */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      {entries.map((e) => (
                        <div key={e.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 12px", borderRadius: "10px",
                          background: e.amount > 0 ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)",
                          border: `1px solid ${e.amount > 0 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)"}`,
                          transition: "background 0.15s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: e.amount > 0 ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {e.amount > 0
                                ? <TrendingUp style={{ width: "13px", height: "13px", color: "#4ade80" }} />
                                : <TrendingDown style={{ width: "13px", height: "13px", color: "#f87171" }} />}
                            </div>
                            <div>
                              <div style={{ color: "#ddd", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{e.label}</div>
                              <div style={{ color: "#444", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginTop: "1px" }}>{timeAgo(e.timestamp)}</div>
                            </div>
                          </div>
                          <div style={{ color: e.amount > 0 ? "#4ade80" : "#f87171", fontSize: "13px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                            {e.amount > 0 ? "+" : ""}{e.amount} XP
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}