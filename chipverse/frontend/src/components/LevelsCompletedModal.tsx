import { motion, AnimatePresence } from "framer-motion";
import { X, Target, CheckCircle2, Lock } from "lucide-react";
import { Link } from "wouter";
import { DOMAIN_LIST, ROADMAPS } from "@/lib/data";
import { DOMAIN_THEMES } from "@/lib/themes";

interface Props {
  open: boolean;
  onClose: () => void;
  completedLevels: Record<string, number[]>;
}

export default function LevelsCompletedModal({ open, onClose, completedLevels }: Props) {
  const totalCompleted = Object.values(completedLevels).reduce((s, a) => s + a.length, 0);
  const totalLevels    = DOMAIN_LIST.reduce((s, d) => s + (ROADMAPS[d.id as keyof typeof ROADMAPS]?.length || 0), 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vw,40px)", background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "620px",
              maxHeight: "calc(100vh - 80px)",
              background: "rgba(8,8,20,0.99)",
              border: "1px solid rgba(59,130,246,0.35)",
              borderRadius: "22px", overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: "0 0 60px rgba(59,130,246,0.1), 0 30px 80px rgba(0,0,0,0.9)",
            }}
          >
            <div style={{ height: "3px", background: "linear-gradient(90deg,#3b82f6,#6366f1,#3b82f6)", flexShrink: 0 }} />

            <div style={{ padding: "22px 26px 10px", flexShrink: 0 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Target style={{ width: "20px", height: "20px", color: "#60a5fa" }} />
                  </div>
                  <div>
                    <div style={{ color: "#555", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "2px" }}>Progress</div>
                    <div style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "20px" }}>
                      {totalCompleted} <span style={{ color: "#444", fontSize: "14px" }}>/ {totalLevels} Levels</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "14px", height: "14px" }} />
                </button>
              </div>

              {/* Overall progress bar */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#555", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>Overall completion</span>
                  <span style={{ color: "#60a5fa", fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                    {totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0}%
                  </span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "999px", background: "linear-gradient(90deg,#3b82f6,#6366f1)", width: `${totalLevels > 0 ? (totalCompleted / totalLevels) * 100 : 0}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>

            {/* Domain list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 26px 24px", scrollbarWidth: "thin", scrollbarColor: "#222 transparent" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {DOMAIN_LIST.map(domain => {
                  const levels   = ROADMAPS[domain.id as keyof typeof ROADMAPS] || [];
                  const done     = completedLevels[domain.id] || [];
                  const pct      = levels.length > 0 ? Math.round((done.length / levels.length) * 100) : 0;
                  const theme    = DOMAIN_THEMES[domain.id];
                  const started  = done.length > 0;
                  const finished = done.length === levels.length && levels.length > 0;

                  return (
                    <div key={domain.id} style={{
                      padding: "14px 16px", borderRadius: "14px",
                      background: started ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
                      border: `1px solid ${finished ? theme.border : started ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                      transition: "all 0.2s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: started ? `${theme.primary}20` : "rgba(255,255,255,0.04)", border: `1px solid ${started ? `${theme.primary}40` : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {finished
                              ? <CheckCircle2 style={{ width: "15px", height: "15px", color: theme.primary }} />
                              : started
                              ? <theme.icon style={{ width: "15px", height: "15px", color: theme.primary }} />
                              : <Lock style={{ width: "13px", height: "13px", color: "#333" }} />}
                          </div>
                          <div>
                            <div style={{ color: started ? "#fff" : "#444", fontSize: "13px", fontWeight: 700 }}>{domain.name}</div>
                            <div style={{ color: "#555", fontSize: "10px", fontFamily: "'DM Mono', monospace" }}>
                              {done.length}/{levels.length} levels
                              {finished && <span style={{ color: theme.primary, marginLeft: "6px" }}>✓ Complete</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: started ? theme.primary : "#333", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{pct}%</span>
                          <Link href={`/path/${domain.id}`} onClick={onClose}
                            style={{ padding: "4px 10px", borderRadius: "7px", background: started ? `${theme.primary}18` : "rgba(255,255,255,0.04)", border: `1px solid ${started ? `${theme.primary}30` : "rgba(255,255,255,0.06)"}`, color: started ? theme.primary : "#444", fontSize: "10px", fontFamily: "'DM Mono', monospace", textDecoration: "none", whiteSpace: "nowrap" }}>
                            {started ? (finished ? "Review" : "Continue") : "Start →"}
                          </Link>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: "999px", background: theme.gradient, width: `${pct}%`, transition: "width 0.6s ease" }} />
                      </div>

                      {/* Completed level dots */}
                      {started && (
                        <div style={{ display: "flex", gap: "3px", marginTop: "8px", flexWrap: "wrap" }}>
                          {levels.map(l => {
                            const isDone = done.includes(l.id);
                            return (
                              <div key={l.id} title={`Level ${l.level}: ${l.title}`} style={{ width: "16px", height: "5px", borderRadius: "999px", background: isDone ? theme.gradient : "rgba(255,255,255,0.06)", transition: "all 0.3s", boxShadow: isDone ? `0 0 4px ${theme.glow}` : "none" }} />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}