import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, CheckCircle2, XCircle, RotateCcw,
  BookOpen, Cpu, Target, FileText, Trophy, Lock, RefreshCw,
} from "lucide-react";
import { DomainTheme } from "@/lib/themes";
import { SubLevel, SubLevelType, ResearchLevelData } from "@/lib/data";
import ResourceSection from "@/components/ResourceSection";

const SUB_TYPE_CONFIG: Record<SubLevelType, { icon: React.ElementType; label: string; color: string }> = {
  background: { icon: BookOpen, label: "Background",         color: "#60a5fa" },
  techniques:  { icon: Cpu,      label: "Present Techniques", color: "#34d399" },
  angles:      { icon: Target,   label: "Research Angles",    color: "#f59e0b" },
  paper:       { icon: FileText, label: "Research Paper",     color: "#a78bfa" },
};

const SUB_TYPE_API: Record<SubLevelType, string> = {
  background:  "CONCEPT",
  techniques:  "SYNTAX",
  angles:      "WALKTHROUGH",
  paper:       "LAB",
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function SubLevelQuiz({
  subLevel, theme, onComplete,
}: { subLevel: SubLevel; theme: DomainTheme; onComplete: (passed: boolean) => void }) {
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const q = subLevel.quiz[current];
  const score = answers.filter(Boolean).length;
  const passed = score >= 2;

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    setAnswers((prev) => [...prev, idx === q.answer]);
  };

  const handleNext = () => {
    if (current + 1 < subLevel.quiz.length) {
      setCurrent((c) => c + 1); setSelected(null); setShowAnswer(false);
    } else { setPhase("result"); }
  };

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setAnswers([]); setShowAnswer(false); setPhase("quiz");
  };

  if (phase === "result") return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
      <div className="flex justify-center">
        {passed ? (
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: theme.card, border: `2px solid ${theme.primary}`, boxShadow: `0 0 30px ${theme.glow}` }}>
            <Trophy style={{ width: "36px", height: "36px", color: theme.primary }} />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/10 border-2 border-red-500/40">
            <XCircle style={{ width: "36px", height: "36px", color: "#f87171" }} />
          </div>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-bold text-white">{passed ? "Sub-level Complete! 🎉" : "Not quite..."}</h4>
        <p className="text-gray-300 text-sm mt-2">{score} / {subLevel.quiz.length} correct</p>
      </div>
      <div className="flex justify-center gap-3">
        {subLevel.quiz.map((_, i) => (
          <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            answers[i] ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}>{answers[i] ? "✓" : "✗"}</div>
        ))}
      </div>
      {passed ? (
        <div className="p-4 rounded-2xl border text-center" style={{ background: theme.card, borderColor: theme.border }}>
          <div className="text-lg font-bold" style={{ color: theme.primary }}>+{subLevel.xp} XP Earned! 🎊</div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
          Need 2+ correct to pass. Review the content and retry!
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={handleRetry}
          className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-semibold flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
        {passed && (
          <button onClick={() => onComplete(true)}
            className="flex-1 py-3 rounded-xl font-bold text-black"
            style={{ background: theme.gradient, boxShadow: `0 0 18px ${theme.glow}` }}>
            Claim XP →
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-400 font-mono">Question {current + 1} of {subLevel.quiz.length}</span>
        <span className="font-mono font-bold" style={{ color: theme.primary }}>{answers.filter(Boolean).length} correct</span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(current / subLevel.quiz.length) * 100}%`, background: theme.gradient }} />
      </div>
      <div className="p-5 rounded-2xl border border-white/10" style={{ background: "rgba(0,0,0,0.5)" }}>
        <p className="text-white font-medium text-base leading-relaxed">{q.q}</p>
      </div>
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let cls = "border-white/10 bg-white/5 text-gray-200 hover:border-white/25 hover:bg-white/8 cursor-pointer";
          if (showAnswer) {
            if (idx === q.answer) cls = "border-green-500/60 bg-green-500/10 text-green-300";
            else if (idx === selected) cls = "border-red-500/60 bg-red-500/10 text-red-300";
            else cls = "border-white/5 bg-white/3 text-gray-500 opacity-40";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${cls}`}>
              <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
              {showAnswer && idx === q.answer && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto shrink-0" />}
              {showAnswer && idx === selected && idx !== q.answer && <XCircle className="w-4 h-4 text-red-400 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
      {showAnswer && (
        <button onClick={handleNext}
          className="w-full py-3.5 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2"
          style={{ background: theme.gradient, boxShadow: `0 0 16px ${theme.glow}` }}>
          {current + 1 < subLevel.quiz.length ? "Next Question →" : "See Results"}
        </button>
      )}
    </div>
  );
}

// ─── Centered full-page sub-level content modal ────────────────────────────────
function SubLevelModal({
  subLevel, theme, isCompleted, domain, levelId, onClose, onComplete,
}: {
  subLevel: SubLevel; theme: DomainTheme; isCompleted: boolean;
  domain: string; levelId: number;
  onClose: () => void; onComplete: () => void;
}) {
  const config = SUB_TYPE_CONFIG[subLevel.type];
  const Icon = config.icon;
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(16px, 3vw, 48px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "820px",
          maxHeight: "calc(100vh - clamp(32px, 6vw, 96px))",
          background: "rgba(8,8,20,0.98)",
          border: `1px solid ${theme.border}`,
          borderRadius: "24px", overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: `0 0 60px ${theme.glow}, 0 30px 80px rgba(0,0,0,0.85)`,
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div style={{ height: "3px", background: theme.gradient, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          padding: "22px 28px", display: "flex", alignItems: "center", gap: "14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
          background: `linear-gradient(135deg, ${theme.card}, transparent)`,
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isCompleted ? theme.gradient : `${config.color}20`,
            border: `1px solid ${isCompleted ? "transparent" : `${config.color}40`}`,
            boxShadow: `0 0 16px ${isCompleted ? theme.glow : `${config.color}44`}`,
          }}>
            {isCompleted
              ? <CheckCircle2 style={{ width: "22px", height: "22px", color: "#000" }} />
              : <Icon style={{ width: "22px", height: "22px", color: config.color }} />
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: config.color, fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>
              {config.label}
            </div>
            <h2 style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "clamp(16px, 2vw, 20px)", margin: 0 }}>
              {subLevel.title}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.primary, borderRadius: "999px", padding: "4px 14px", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
              +{subLevel.xp} XP
            </span>
            {isCompleted && (
              <span style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", borderRadius: "999px", padding: "4px 12px", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                ✓ Done
              </span>
            )}
            <button onClick={onClose}
              style={{ width: "38px", height: "38px", borderRadius: "11px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px", scrollbarWidth: "thin", scrollbarColor: `${theme.primary}44 transparent` }}>
          {!showQuiz ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* LEFT */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ padding: "18px 20px", borderRadius: "16px", background: `${theme.card}`, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.primary, fontSize: "9.5px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Overview</div>
                    <p style={{ color: "#e2e2e2", fontSize: "13.5px", fontFamily: "'DM Mono', monospace", lineHeight: 1.75, margin: 0 }}>
                      {subLevel.summary}
                    </p>
                  </div>
                  <div style={{ padding: "18px 20px", borderRadius: "16px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", flex: 1 }}>
                    <div style={{ color: "#888", fontSize: "9.5px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Deep Dive</div>
                    <p style={{ color: "#d0d0d0", fontSize: "12.5px", fontFamily: "'DM Mono', monospace", lineHeight: 1.8, margin: 0 }}>
                      {subLevel.deepDive}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ padding: "18px 20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ color: "#888", fontSize: "9.5px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Key Points</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {subLevel.keyPoints.map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: config.color, marginTop: "6px", flexShrink: 0, boxShadow: `0 0 6px ${config.color}88` }} />
                          <span style={{ color: "#e8e8e8", fontSize: "12.5px", lineHeight: 1.65 }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isCompleted ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ padding: "14px 16px", borderRadius: "14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.28)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckCircle2 style={{ width: "16px", height: "16px", color: "#4ade80", flexShrink: 0 }} />
                        <span style={{ color: "#4ade80", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                          Completed — +{subLevel.xp} XP earned
                        </span>
                      </div>
                      <button onClick={() => setShowQuiz(true)}
                        style={{ padding: "12px 20px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#bbb", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                        <RefreshCw style={{ width: "13px", height: "13px" }} />
                        Retake Quiz for Practice
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowQuiz(true)}
                      style={{ padding: "16px 24px", borderRadius: "16px", background: theme.gradient, border: "none", color: "#000", fontFamily: "'Orbitron', monospace", fontSize: "12px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", boxShadow: `0 0 24px ${theme.glow}`, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      Take Quiz → Earn +{subLevel.xp} XP
                    </button>
                  )}
                </div>
              </div>

              {/* ── Faculty Resources ── */}
              <ResourceSection
                domain={domain}
                levelId={levelId}
                subLevelType={SUB_TYPE_API[subLevel.type]}
                accentColor={theme.primary}
              />
            </>
          ) : (
            <div style={{ maxWidth: "580px", margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <div style={{ color: config.color, fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>
                    Quiz — {config.label}
                  </div>
                  <div style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "14px" }}>
                    {subLevel.title}
                  </div>
                </div>
                <button onClick={() => setShowQuiz(false)}
                  style={{ padding: "6px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>
                  ← Back
                </button>
              </div>
              <SubLevelQuiz subLevel={subLevel} theme={theme}
                onComplete={(passed) => {
                  if (passed && !isCompleted) { setShowQuiz(false); onComplete(); }
                  else { setShowQuiz(false); }
                }} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sub-level list card ───────────────────────────────────────────────────────
function SubLevelCard({
  subLevel, theme, isCompleted, isLocked, index, side, onClick,
}: {
  subLevel: SubLevel; theme: DomainTheme; isCompleted: boolean;
  isLocked: boolean; index: number; side: "left" | "right";
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const config = SUB_TYPE_CONFIG[subLevel.type];
  const Icon = config.icon;

  const cardVariants = {
    hidden: { opacity: 0, x: side === "right" ? 70 : -70, scale: 0.88, filter: "blur(4px)" },
    visible: {
      opacity: 1, x: 0, scale: 1, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 320, damping: 26, delay: index * 0.09 },
    },
    exit: {
      opacity: 0, x: side === "right" ? 50 : -50, scale: 0.92, filter: "blur(3px)",
      transition: { duration: 0.18, delay: (3 - index) * 0.04 },
    },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit"
      onHoverStart={() => !isLocked && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => !isLocked && onClick()}
    >
      <div style={{
        background: isCompleted ? `linear-gradient(135deg, ${theme.card}, rgba(8,8,20,0.97))` : hovered ? "rgba(20,20,35,0.98)" : "rgba(10,10,20,0.95)",
        border: `1px solid ${isCompleted ? hovered ? theme.primary : theme.border : hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)"}`,
        borderRadius: "14px", overflow: "hidden", transition: "all 0.25s ease",
        boxShadow: isCompleted ? hovered ? `0 0 22px ${theme.glow}` : `0 0 12px ${theme.glow}` : hovered ? `0 6px 28px rgba(0,0,0,0.6), 0 0 14px ${config.color}22` : "0 2px 12px rgba(0,0,0,0.35)",
        opacity: isLocked ? 0.38 : 1,
        cursor: isLocked ? "not-allowed" : "pointer",
        transform: hovered && !isLocked ? "translateY(-2px) scale(1.01)" : "none",
      }}>
        {(isCompleted || (hovered && !isLocked)) && (
          <div style={{ height: "2px", background: isCompleted ? theme.gradient : `linear-gradient(90deg, ${config.color}88, transparent)` }} />
        )}
        <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isCompleted ? theme.gradient : hovered ? `${config.color}28` : `${config.color}14`, border: `1px solid ${isCompleted ? "transparent" : `${config.color}${hovered ? "55" : "28"}`}`, boxShadow: isCompleted ? `0 0 12px ${theme.glow}` : hovered ? `0 0 10px ${config.color}44` : "none", transition: "all 0.25s" }}>
            {isCompleted ? <CheckCircle2 style={{ width: "16px", height: "16px", color: "#000" }} />
              : isLocked ? <Lock style={{ width: "13px", height: "13px", color: "#444" }} />
              : <Icon style={{ width: "16px", height: "16px", color: config.color }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "9px", fontFamily: "'DM Mono', monospace", color: isCompleted ? theme.primary : config.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>{config.label}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: isCompleted ? "#fff" : isLocked ? "#444" : hovered ? "#fff" : "#eee", transition: "color 0.2s" }}>{subLevel.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: isCompleted ? theme.primary : "#555" }}>+{subLevel.xp} XP</span>
            {isCompleted && <div style={{ width: "18px", height: "18px", borderRadius: "5px", background: `${theme.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight style={{ width: "11px", height: "11px", color: theme.primary }} /></div>}
            {!isLocked && !isCompleted && <ChevronRight style={{ width: "14px", height: "14px", color: hovered ? "#bbb" : "#444" }} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Level complete celebration ────────────────────────────────────────────────
function LevelCompleteCelebration({ levelData, theme, onClaim }: {
  levelData: ResearchLevelData; theme: DomainTheme; onClaim: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px, 3vw, 48px)" }}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{ background: "rgba(8,8,20,0.99)", border: `1px solid ${theme.border}`, borderRadius: "24px", padding: "44px", textAlign: "center", maxWidth: "480px", width: "100%", boxShadow: `0 0 60px ${theme.glow}, 0 24px 70px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏆</div>
        <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "#fff", margin: "0 0 8px" }}>Level Complete!</h3>
        <p style={{ color: theme.primary, fontSize: "14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, marginBottom: "20px" }}>All 4 sub-levels completed</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
          <span style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.primary, borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>+{levelData.bonusXp} Bonus XP</span>
          <span style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>🏅 {levelData.badge}</span>
        </div>
        <button onClick={onClaim} style={{ background: theme.gradient, border: "none", borderRadius: "14px", color: "#000", fontFamily: "'Orbitron', monospace", fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", padding: "14px 40px", cursor: "pointer", boxShadow: `0 0 26px ${theme.glow}` }}>
          Claim Badge + XP 🏆
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────
interface ResearchSubLevelPanelProps {
  levelData: ResearchLevelData;
  levelTitle: string;
  levelIndex: number;
  theme: DomainTheme;
  completedSubLevels: string[];
  celebrationClaimed: boolean;
  domain: string;
  onSubLevelComplete: (subLevelId: string, xp: number) => void;
  onLevelComplete: () => void;
  onClose: () => void;
}

export default function ResearchSubLevelPanel({
  levelData, levelTitle, levelIndex, theme,
  completedSubLevels, celebrationClaimed, domain,
  onSubLevelComplete, onLevelComplete, onClose,
}: ResearchSubLevelPanelProps) {
  const side = levelIndex % 2 === 0 ? "right" : "left";
  const allDone = levelData.subLevels.every((sl) => completedSubLevels.includes(sl.id));
  const [showCelebration, setShowCelebration] = useState(false);
  const [openSubLevel, setOpenSubLevel] = useState<SubLevel | null>(null);
  const completedCount = levelData.subLevels.filter((sl) => completedSubLevels.includes(sl.id)).length;

  useEffect(() => {
    if (allDone && !celebrationClaimed) {
      const t = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(t);
    } else {
      setShowCelebration(false);
    }
  }, [allDone, celebrationClaimed]);

  const getIsLocked = (idx: number) => {
    if (idx === 0) return false;
    return !completedSubLevels.includes(levelData.subLevels[idx - 1].id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: side === "right" ? 70 : -70, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: side === "right" ? 50 : -50, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{ position: "fixed", top: "80px", [side]: "24px", width: "clamp(280px, 30vw, 380px)", maxHeight: "calc(100vh - 110px)", overflowY: "auto", zIndex: 30, scrollbarWidth: "thin", scrollbarColor: `${theme.primary}44 transparent` }}
      >
        <div style={{ background: "rgba(8,8,20,0.98)", border: `1px solid ${theme.border}`, borderRadius: "18px", padding: "15px 17px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 0 32px ${theme.glow}, 0 8px 36px rgba(0,0,0,0.8)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 2 }}>
          <div>
            <div style={{ color: theme.primary, fontSize: "9.5px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>Level {levelIndex} Sub-levels</div>
            <div style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "13px" }}>{levelTitle}</div>
            <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
              {levelData.subLevels.map((sl, i) => (
                <div key={i} style={{ width: "28px", height: "4px", borderRadius: "999px", background: completedSubLevels.includes(sl.id) ? theme.gradient : "rgba(255,255,255,0.10)", transition: "all 0.4s", boxShadow: completedSubLevels.includes(sl.id) ? `0 0 6px ${theme.glow}` : "none" }} />
              ))}
            </div>
            <div style={{ color: "#777", fontSize: "9.5px", fontFamily: "'DM Mono', monospace", marginTop: "5px" }}>{completedCount}/{levelData.subLevels.length} complete · +{levelData.bonusXp} bonus XP</div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#bbb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "12px" }}>
            <X style={{ width: "13px", height: "13px" }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <AnimatePresence>
            {levelData.subLevels.map((sl, i) => (
              <SubLevelCard key={sl.id} subLevel={sl} theme={theme}
                isCompleted={completedSubLevels.includes(sl.id)}
                isLocked={getIsLocked(i)} index={i} side={side}
                onClick={() => setOpenSubLevel(sl)} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {openSubLevel && (
          <SubLevelModal
            subLevel={openSubLevel} theme={theme}
            isCompleted={completedSubLevels.includes(openSubLevel.id)}
            domain={domain}
            levelId={levelData.levelId}
            onClose={() => setOpenSubLevel(null)}
            onComplete={() => {
              onSubLevelComplete(openSubLevel.id, openSubLevel.xp);
              setOpenSubLevel(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <LevelCompleteCelebration levelData={levelData} theme={theme}
            onClaim={() => { setShowCelebration(false); onLevelComplete(); }} />
        )}
      </AnimatePresence>
    </>
  );
}