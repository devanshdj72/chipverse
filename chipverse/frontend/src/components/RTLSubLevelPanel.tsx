import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, CheckCircle2, XCircle, RotateCcw,
  BookOpen, Code, Eye, FlaskConical, Brain, Lock, Trophy, RefreshCw,
} from "lucide-react";
import { DomainTheme } from "@/lib/themes";
import { RTLSubLevel, RTLSubLevelType, RTLLevelData } from "@/lib/data";
import LabEditor from "@/components/LabEditor";
import ResourceSection from "@/components/ResourceSection";

const SUB_TYPE_CONFIG: Record<RTLSubLevelType, { icon: React.ElementType; label: string; color: string }> = {
  concept:     { icon: BookOpen,     label: "Concept",          color: "#60a5fa" },
  syntax:      { icon: Code,         label: "Syntax & Patterns", color: "#34d399" },
  walkthrough: { icon: Eye,          label: "Walkthrough",       color: "#f59e0b" },
  lab:         { icon: FlaskConical, label: "Lab",               color: "#a78bfa" },
  quiz:        { icon: Brain,        label: "Quiz",              color: "#f472b6" },
};

// Maps local type to API SubLevelType
const SUB_TYPE_API: Record<RTLSubLevelType, string> = {
  concept:     "CONCEPT",
  syntax:      "SYNTAX",
  walkthrough: "WALKTHROUGH",
  lab:         "LAB",
  quiz:        "QUIZ",
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
function QuizView({
  subLevel, theme, onComplete,
}: { subLevel: RTLSubLevel; theme: DomainTheme; onComplete: () => void }) {
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const quiz = subLevel.quiz!;
  const q = quiz[current];
  const score = answers.filter(Boolean).length;
  const passed = score >= Math.ceil(quiz.length * 0.6);

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    setAnswers((p) => [...p, idx === q.answer]);
  };

  const handleNext = () => {
    if (current + 1 < quiz.length) { setCurrent((c) => c + 1); setSelected(null); setShowAnswer(false); }
    else setPhase("result");
  };

  const handleRetry = () => { setCurrent(0); setSelected(null); setAnswers([]); setShowAnswer(false); setPhase("quiz"); };

  if (phase === "result") return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        {passed
          ? <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: theme.card, border: `2px solid ${theme.primary}`, boxShadow: `0 0 24px ${theme.glow}` }}>
              <Trophy style={{ width: "28px", height: "28px", color: theme.primary }} />
            </div>
          : <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/10 border-2 border-red-500/40">
              <XCircle style={{ width: "28px", height: "28px", color: "#f87171" }} />
            </div>
        }
      </div>
      <div>
        <h4 className="text-xl font-bold text-white">{passed ? "Quiz Passed! 🎉" : "Not quite..."}</h4>
        <p className="text-gray-300 text-sm mt-1">{score}/{quiz.length} correct</p>
      </div>
      <div className="flex justify-center gap-2">
        {quiz.map((_, i) => (
          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${answers[i] ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"}`}>
            {answers[i] ? "✓" : "✗"}
          </div>
        ))}
      </div>
      {passed
        ? <div className="p-3 rounded-xl border text-center" style={{ background: theme.card, borderColor: theme.border }}>
            <div className="font-bold" style={{ color: theme.primary }}>+{subLevel.xp} XP Earned! 🎊</div>
          </div>
        : <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            Need {Math.ceil(quiz.length * 0.6)}+ correct to pass.
          </div>
      }
      <div className="flex gap-2">
        <button onClick={handleRetry} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm flex items-center justify-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </button>
        {passed && (
          <button onClick={onComplete} className="flex-1 py-2.5 rounded-xl font-bold text-black text-sm" style={{ background: theme.gradient }}>
            Claim XP →
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400 font-mono">Q{current + 1}/{quiz.length}</span>
        <span className="font-mono font-bold" style={{ color: theme.primary }}>{answers.filter(Boolean).length} correct</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full">
        <div className="h-full rounded-full transition-all" style={{ width: `${(current / quiz.length) * 100}%`, background: theme.gradient }} />
      </div>
      <div className="p-4 rounded-xl border border-white/10" style={{ background: "rgba(0,0,0,0.5)" }}>
        <p className="text-white font-medium text-sm leading-relaxed">{q.q}</p>
      </div>
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          let cls = "border-white/10 bg-white/5 text-gray-200 hover:border-white/25 cursor-pointer";
          if (showAnswer) {
            if (idx === q.answer) cls = "border-green-500/60 bg-green-500/10 text-green-300";
            else if (idx === selected) cls = "border-red-500/60 bg-red-500/10 text-red-300";
            else cls = "border-white/5 bg-white/3 text-gray-500 opacity-40";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition-all flex items-center gap-3 ${cls}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
              {showAnswer && idx === q.answer && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 ml-auto" />}
              {showAnswer && idx === selected && idx !== q.answer && <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto" />}
            </button>
          );
        })}
      </div>
      {showAnswer && (
        <button onClick={handleNext} className="w-full py-2.5 rounded-xl font-bold text-black text-sm"
          style={{ background: theme.gradient, boxShadow: `0 0 14px ${theme.glow}` }}>
          {current + 1 < quiz.length ? "Next →" : "See Results"}
        </button>
      )}
    </div>
  );
}

// ─── Content modal ─────────────────────────────────────────────────────────────
function SubLevelModal({
  subLevel, theme, isCompleted, levelId, domain, onClose, onComplete,
}: {
  subLevel: RTLSubLevel; theme: DomainTheme; isCompleted: boolean;
  levelId: number; domain: string; onClose: () => void; onComplete: () => void;
}) {
  const config = SUB_TYPE_CONFIG[subLevel.type];
  const Icon = config.icon;
  const [showQuiz, setShowQuiz] = useState(false);

  const isLab = subLevel.type === "lab";
  const isQuiz = subLevel.type === "quiz";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px, 2vw, 40px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: isLab ? "960px" : "820px",
          height: isLab ? "calc(100vh - clamp(24px, 4vw, 80px))" : "auto",
          maxHeight: isLab ? undefined : "calc(100vh - clamp(24px, 4vw, 80px))",
          background: "rgba(8,8,20,0.98)",
          border: `1px solid ${theme.border}`,
          borderRadius: "22px", overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: `0 0 60px ${theme.glow}, 0 30px 80px rgba(0,0,0,0.85)`,
        }}
      >
        {/* Accent bar */}
        <div style={{ height: "3px", background: theme.gradient, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          padding: "18px 24px", display: "flex", alignItems: "center", gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
          background: `linear-gradient(135deg, ${theme.card}, transparent)`,
        }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${config.color}20`, border: `1px solid ${config.color}40`, boxShadow: `0 0 14px ${config.color}44` }}>
            <Icon style={{ width: "20px", height: "20px", color: config.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: config.color, fontSize: "9.5px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{config.label}</div>
            <h2 style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "clamp(14px, 1.8vw, 18px)", margin: 0 }}>{subLevel.title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.primary, borderRadius: "999px", padding: "3px 12px", fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>+{subLevel.xp} XP</span>
            {isCompleted && <span style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", borderRadius: "999px", padding: "3px 10px", fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>✓ Done</span>}
            <button onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* LAB type */}
          {isLab && subLevel.lab && (
            <LabEditor
              labData={subLevel.lab}
              theme={theme}
              labId={subLevel.id}
              isCompleted={isCompleted}
              xp={subLevel.xp}
              onComplete={onComplete}
            />
          )}

          {/* QUIZ type */}
          {isQuiz && !isLab && (
            <div style={{ padding: "24px", overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
              {!showQuiz && !isCompleted ? (
                <div style={{ textAlign: "center", paddingTop: "20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "14px" }}>🧠</div>
                  <h3 style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>Ready to test your knowledge?</h3>
                  <p style={{ color: "#888", fontSize: "12px", fontFamily: "'DM Mono', monospace", marginBottom: "20px" }}>{subLevel.quiz?.length} questions · Need 60%+ to pass · +{subLevel.xp} XP</p>
                  <button onClick={() => setShowQuiz(true)} style={{ padding: "12px 32px", borderRadius: "14px", background: theme.gradient, border: "none", color: "#000", fontFamily: "'Orbitron', monospace", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: `0 0 20px ${theme.glow}` }}>
                    Start Quiz →
                  </button>
                  {/* Resources for quiz sub-level */}
                  <ResourceSection domain={domain} levelId={levelId} subLevelType={SUB_TYPE_API[subLevel.type]} accentColor={theme.primary} />
                </div>
              ) : isCompleted ? (
                <div style={{ textAlign: "center", paddingTop: "20px" }}>
                  <CheckCircle2 style={{ width: "48px", height: "48px", color: "#4ade80", margin: "0 auto 12px" }} />
                  <h3 style={{ color: "#4ade80", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "16px", marginBottom: "8px" }}>Quiz Completed!</h3>
                  <p style={{ color: "#888", fontSize: "12px", fontFamily: "'DM Mono', monospace", marginBottom: "16px" }}>+{subLevel.xp} XP earned</p>
                  <button onClick={() => setShowQuiz(true)} style={{ padding: "10px 24px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#aaa", fontFamily: "'DM Mono', monospace", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", margin: "0 auto" }}>
                    <RefreshCw style={{ width: "12px", height: "12px" }} /> Retake for Practice
                  </button>
                  {showQuiz && <div style={{ marginTop: "20px" }}><QuizView subLevel={subLevel} theme={theme} onComplete={() => {}} /></div>}
                  <ResourceSection domain={domain} levelId={levelId} subLevelType={SUB_TYPE_API[subLevel.type]} accentColor={theme.primary} />
                </div>
              ) : (
                <>
                  <QuizView subLevel={subLevel} theme={theme} onComplete={onComplete} />
                  <ResourceSection domain={domain} levelId={levelId} subLevelType={SUB_TYPE_API[subLevel.type]} accentColor={theme.primary} />
                </>
              )}
            </div>
          )}

          {/* CONTENT types: concept, syntax, walkthrough */}
          {!isLab && !isQuiz && (
            <div style={{ padding: "24px", overflowY: "auto", flex: 1, scrollbarWidth: "thin", scrollbarColor: `${theme.primary}44 transparent` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                {/* Left: summary + content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ padding: "16px 18px", borderRadius: "14px", background: theme.card, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.primary, fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Overview</div>
                    <p style={{ color: "#e2e2e2", fontSize: "13px", fontFamily: "'DM Mono', monospace", lineHeight: 1.75, margin: 0 }}>{subLevel.summary}</p>
                  </div>
                  {subLevel.content && (
                    <div style={{ padding: "16px 18px", borderRadius: "14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", flex: 1 }}>
                      <div style={{ color: "#888", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                        {subLevel.type === "walkthrough" ? "Code Walkthrough" : "Deep Dive"}
                      </div>
                      <pre style={{ color: "#d0d0d0", fontSize: "11.5px", fontFamily: "'DM Mono', monospace", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                        {subLevel.content}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Right: key points + CTA */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {subLevel.keyPoints && (
                    <div style={{ padding: "16px 18px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ color: "#888", fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Key Points</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {subLevel.keyPoints.map((pt, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: config.color, marginTop: "6px", flexShrink: 0, boxShadow: `0 0 5px ${config.color}88` }} />
                            <span style={{ color: "#e8e8e8", fontSize: "12px", lineHeight: 1.65 }}>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isCompleted ? (
                    <button onClick={onComplete}
                      style={{ padding: "14px 20px", borderRadius: "14px", background: theme.gradient, border: "none", color: "#000", fontFamily: "'Orbitron', monospace", fontSize: "11px", fontWeight: 700, cursor: "pointer", boxShadow: `0 0 20px ${theme.glow}`, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                      Mark Complete → +{subLevel.xp} XP
                    </button>
                  ) : (
                    <div style={{ padding: "14px 16px", borderRadius: "14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.28)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 style={{ width: "15px", height: "15px", color: "#4ade80" }} />
                      <span style={{ color: "#4ade80", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>Completed — +{subLevel.xp} XP</span>
                    </div>
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
  subLevel: RTLSubLevel; theme: DomainTheme; isCompleted: boolean;
  isLocked: boolean; index: number; side: "left" | "right"; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const config = SUB_TYPE_CONFIG[subLevel.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 60 : -60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: side === "right" ? 40 : -40, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, delay: index * 0.08 }}
      onHoverStart={() => !isLocked && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => !isLocked && onClick()}
    >
      <div style={{
        background: isCompleted ? `linear-gradient(135deg, ${theme.card}, rgba(8,8,20,0.97))` : hovered ? "rgba(20,20,35,0.98)" : "rgba(10,10,20,0.95)",
        border: `1px solid ${isCompleted ? (hovered ? theme.primary : theme.border) : hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)"}`,
        borderRadius: "13px", overflow: "hidden",
        transition: "all 0.22s ease",
        boxShadow: isCompleted ? (hovered ? `0 0 20px ${theme.glow}` : `0 0 10px ${theme.glow}`) : hovered ? `0 5px 24px rgba(0,0,0,0.6)` : "0 2px 10px rgba(0,0,0,0.3)",
        opacity: isLocked ? 0.35 : 1,
        cursor: isLocked ? "not-allowed" : "pointer",
        transform: hovered && !isLocked ? "translateY(-2px)" : "none",
      }}>
        {(isCompleted || (hovered && !isLocked)) && (
          <div style={{ height: "2px", background: isCompleted ? theme.gradient : `linear-gradient(90deg, ${config.color}88, transparent)` }} />
        )}
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isCompleted ? theme.gradient : hovered ? `${config.color}28` : `${config.color}14`, border: `1px solid ${isCompleted ? "transparent" : `${config.color}${hovered ? "55" : "28"}`}`, boxShadow: isCompleted ? `0 0 10px ${theme.glow}` : hovered ? `0 0 9px ${config.color}44` : "none", transition: "all 0.22s" }}>
            {isCompleted ? <CheckCircle2 style={{ width: "15px", height: "15px", color: "#000" }} />
              : isLocked ? <Lock style={{ width: "12px", height: "12px", color: "#444" }} />
              : <Icon style={{ width: "15px", height: "15px", color: config.color }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "8.5px", fontFamily: "'DM Mono', monospace", color: isCompleted ? theme.primary : config.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>{config.label}</div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: isCompleted ? "#fff" : isLocked ? "#444" : hovered ? "#fff" : "#eee", transition: "color 0.2s" }}>{subLevel.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span style={{ fontSize: "9.5px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: isCompleted ? theme.primary : "#555" }}>+{subLevel.xp} XP</span>
            {!isLocked && <ChevronRight style={{ width: "12px", height: "12px", color: hovered ? "#bbb" : "#444" }} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Level complete celebration ────────────────────────────────────────────────
function LevelComplete({ levelData, theme, onClaim }: { levelData: RTLLevelData; theme: DomainTheme; onClaim: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
      <motion.div initial={{ scale: 0.88, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{ background: "rgba(8,8,20,0.99)", border: `1px solid ${theme.border}`, borderRadius: "22px", padding: "42px", textAlign: "center", maxWidth: "460px", width: "100%", boxShadow: `0 0 60px ${theme.glow}, 0 24px 70px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: "60px", marginBottom: "14px" }}>🏆</div>
        <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "20px", color: "#fff", margin: "0 0 6px" }}>Level Complete!</h3>
        <p style={{ color: theme.primary, fontSize: "13px", fontFamily: "'DM Mono', monospace", fontWeight: 700, marginBottom: "18px" }}>All 5 sub-levels completed</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "22px", flexWrap: "wrap" }}>
          <span style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.primary, borderRadius: "999px", padding: "5px 14px", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>+{levelData.bonusXp} Bonus XP</span>
          <span style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308", borderRadius: "999px", padding: "5px 14px", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>🏅 {levelData.badge}</span>
        </div>
        <button onClick={onClaim} style={{ background: theme.gradient, border: "none", borderRadius: "13px", color: "#000", fontFamily: "'Orbitron', monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", padding: "13px 36px", cursor: "pointer", boxShadow: `0 0 24px ${theme.glow}` }}>
          Claim Badge + XP 🏆
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────
interface RTLSubLevelPanelProps {
  levelData: RTLLevelData; levelTitle: string; levelIndex: number;
  theme: DomainTheme; completedSubLevels: string[];
  celebrationClaimed: boolean;
  domain: string; // e.g. "rtl", "verification", "fpga", etc.
  onSubLevelComplete: (subLevelId: string, xp: number) => void;
  onLevelComplete: () => void; onClose: () => void;
}

export default function RTLSubLevelPanel({
  levelData, levelTitle, levelIndex, theme,
  completedSubLevels, celebrationClaimed, domain,
  onSubLevelComplete, onLevelComplete, onClose,
}: RTLSubLevelPanelProps) {
  const side = levelIndex % 2 === 0 ? "right" : "left";
  const allDone = levelData.subLevels.every((sl) => completedSubLevels.includes(sl.id));
  const [showCelebration, setShowCelebration] = useState(false);
  const [openSubLevel, setOpenSubLevel] = useState<RTLSubLevel | null>(null);
  const completedCount = levelData.subLevels.filter((sl) => completedSubLevels.includes(sl.id)).length;

  useEffect(() => {
    if (allDone && !celebrationClaimed && !showCelebration) {
      const t = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(t);
    }
  }, [allDone, celebrationClaimed, showCelebration]);

  const getIsLocked = (idx: number) => {
    if (idx === 0) return false;
    return !completedSubLevels.includes(levelData.subLevels[idx - 1].id);
  };

  return (
    <>
      {/* Side panel */}
      <motion.div
        initial={{ opacity: 0, x: side === "right" ? 70 : -70, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: side === "right" ? 50 : -50, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{ position: "fixed", top: "80px", [side]: "24px", width: "clamp(270px, 28vw, 360px)", maxHeight: "calc(100vh - 110px)", overflowY: "auto", zIndex: 30, scrollbarWidth: "thin", scrollbarColor: `${theme.primary}44 transparent` }}
      >
        {/* Header */}
        <div style={{ background: "rgba(8,8,20,0.98)", border: `1px solid ${theme.border}`, borderRadius: "17px", padding: "14px 16px", marginBottom: "7px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 0 30px ${theme.glow}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 2 }}>
          <div>
            <div style={{ color: theme.primary, fontSize: "9px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Level {levelIndex} Sub-levels</div>
            <div style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontWeight: 800, fontSize: "12.5px" }}>{levelTitle}</div>
            <div style={{ display: "flex", gap: "3px", marginTop: "7px" }}>
              {levelData.subLevels.map((sl, i) => (
                <div key={i} style={{ width: "24px", height: "3.5px", borderRadius: "999px", background: completedSubLevels.includes(sl.id) ? theme.gradient : "rgba(255,255,255,0.10)", transition: "all 0.4s", boxShadow: completedSubLevels.includes(sl.id) ? `0 0 5px ${theme.glow}` : "none" }} />
              ))}
            </div>
            <div style={{ color: "#666", fontSize: "9px", fontFamily: "'DM Mono', monospace", marginTop: "4px" }}>{completedCount}/5 complete · +{levelData.bonusXp} bonus</div>
          </div>
          <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#bbb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "10px" }}>
            <X style={{ width: "12px", height: "12px" }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

      {/* Content modal */}
      <AnimatePresence>
        {openSubLevel && (
          <SubLevelModal
            subLevel={openSubLevel} theme={theme}
            isCompleted={completedSubLevels.includes(openSubLevel.id)}
            levelId={levelData.levelId}
            domain={domain}
            onClose={() => setOpenSubLevel(null)}
            onComplete={() => {
              if (!completedSubLevels.includes(openSubLevel.id)) {
                onSubLevelComplete(openSubLevel.id, openSubLevel.xp);
              }
              setOpenSubLevel(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && !celebrationClaimed && (
          <LevelComplete levelData={levelData} theme={theme}
            onClaim={() => { setShowCelebration(false); onLevelComplete(); }} />
        )}
      </AnimatePresence>
    </>
  );
}