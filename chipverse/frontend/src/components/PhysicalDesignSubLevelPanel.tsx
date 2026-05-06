import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ChevronRight, CheckCircle, Code2, FileText, BookOpen, FlaskConical, BarChart3, HelpCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// ── Sub-level type config ───────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  concept:       { label: "Concept",        icon: BookOpen,      color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  tool_commands: { label: "Tool Commands",  icon: Code2,         color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  report_reading:{ label: "Report Reading", icon: FileText,      color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  lab_cadence:   { label: "Lab — Cadence",  icon: FlaskConical,  color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  lab_synopsys:  { label: "Lab — Synopsys", icon: FlaskConical,  color: "#fb923c", bg: "rgba(251,146,60,0.1)"  },
  lab_analysis:  { label: "Lab — Analysis", icon: BarChart3,     color: "#e879f9", bg: "rgba(232,121,249,0.1)" },
  quiz:          { label: "Quiz",           icon: HelpCircle,    color: "#facc15", bg: "rgba(250,204,21,0.1)"  },
};

interface Props {
  levelData: any;
  levelTitle: string;
  levelIndex: number;
  theme: any;
  completedSubLevels: string[];
  celebrationClaimed: boolean;
  onSubLevelComplete: (id: string, xp: number) => void;
  onLevelComplete: () => void;
  onClose: () => void;
}

export default function PhysicalDesignSubLevelPanel({
  levelData, levelTitle, levelIndex, theme,
  completedSubLevels, celebrationClaimed,
  onSubLevelComplete, onLevelComplete, onClose,
}: Props) {
  const subLevels = levelData?.subLevels ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [labCode, setLabCode] = useState<Record<string, string>>({});
  const [labResult, setLabResult] = useState<Record<string, any>>({});
  const [labLoading, setLabLoading] = useState<Record<string, boolean>>({});
  const [toolTab, setToolTab] = useState<"cadence" | "synopsys">("cadence");
  const [celebration, setCelebration] = useState(false);

  const activeSub = subLevels[activeIdx];
  const cfg = TYPE_CONFIG[activeSub?.type] ?? TYPE_CONFIG.concept;

  const isCompleted = (id: string) => completedSubLevels.includes(id);
  const allDone = subLevels.every((s: any) => isCompleted(s.id));

  function canAccess(idx: number) {
    if (idx === 0) return true;
    return isCompleted(subLevels[idx - 1].id);
  }

  function markComplete(sub: any) {
    if (!isCompleted(sub.id)) {
      onSubLevelComplete(sub.id, sub.xp);
      // Check if all done after this
      const remaining = subLevels.filter((s: any) => s.id !== sub.id && !isCompleted(s.id));
      if (remaining.length === 0 && !celebrationClaimed) {
        setCelebration(true);
      }
    }
    if (activeIdx < subLevels.length - 1) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 300);
    }
  }

  async function submitLab(sub: any) {
    const code = labCode[sub.id] || sub.lab?.starterCode || "";
    setLabLoading(p => ({ ...p, [sub.id]: true }));
    try {
      const res = await api.lab.evaluate({
        labId: sub.id,
        code,
        requiredPatterns: sub.lab?.requiredPatterns || [],
        forbiddenPatterns: sub.lab?.forbiddenPatterns || [],
        xp: sub.xp,
      });
      setLabResult(p => ({ ...p, [sub.id]: res.data }));
      if (res.data?.passed) markComplete(sub);
    } catch {
      setLabResult(p => ({ ...p, [sub.id]: { passed: false, feedback: "Submission error. Try again." } }));
    } finally {
      setLabLoading(p => ({ ...p, [sub.id]: false }));
    }
  }

  function submitQuiz(sub: any) {
    setQuizSubmitted(p => ({ ...p, [sub.id]: true }));
    const allCorrect = sub.quiz.every((q: any, i: number) => quizAnswers[`${sub.id}-${i}`] === q.answer);
    if (allCorrect) markComplete(sub);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
        maxHeight: "82vh", display: "flex", flexDirection: "column",
        background: "rgba(8,8,12,0.98)",
        borderTop: `2px solid ${theme.primary}`,
        borderRadius: "24px 24px 0 0",
        boxShadow: `0 -20px 80px ${theme.glow}, 0 -4px 30px rgba(0,0,0,0.8)`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{ color: theme.primary, fontSize: "10px", fontFamily: "'DM Mono',monospace", fontWeight: 700, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Level {levelIndex} · Physical Design
            </div>
            <div style={{ color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "'Orbitron',sans-serif" }}>{levelTitle}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#888" }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Sub-level tabs */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          {subLevels.map((sub: any, i: number) => {
            const c = TYPE_CONFIG[sub.type] ?? TYPE_CONFIG.concept;
            const done = isCompleted(sub.id);
            const active = i === activeIdx;
            const locked = !canAccess(i);
            return (
              <button
                key={sub.id}
                onClick={() => !locked && setActiveIdx(i)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "8px", flexShrink: 0,
                  border: `1px solid ${active ? c.color : done ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                  background: active ? c.bg : done ? "rgba(255,255,255,0.04)" : "transparent",
                  color: active ? c.color : done ? "#888" : "#444",
                  fontSize: "10px", fontFamily: "'DM Mono',monospace", fontWeight: 700,
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.4 : 1,
                  transition: "all 0.2s",
                }}
              >
                {done
                  ? <CheckCircle style={{ width: "11px", height: "11px", color: "#22c55e" }} />
                  : <c.icon style={{ width: "11px", height: "11px" }} />
                }
                {sub.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeSub?.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>

            {/* XP badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "999px", background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color, fontSize: "10px", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                <cfg.icon style={{ width: "10px", height: "10px" }} />
                {cfg.label}
              </div>
              <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: "999px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7", fontSize: "10px", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                +{activeSub?.xp} XP
              </div>
            </div>

            {/* ── CONCEPT ─────────────────────────────────────── */}
            {activeSub?.type === "concept" && (
              <ConceptView sub={activeSub} theme={theme} onComplete={() => markComplete(activeSub)} completed={isCompleted(activeSub.id)} />
            )}

            {/* ── TOOL COMMANDS ────────────────────────────────── */}
            {activeSub?.type === "tool_commands" && (
              <ToolCommandsView sub={activeSub} theme={theme} toolTab={toolTab} setToolTab={setToolTab} onComplete={() => markComplete(activeSub)} completed={isCompleted(activeSub.id)} />
            )}

            {/* ── REPORT READING ───────────────────────────────── */}
            {activeSub?.type === "report_reading" && (
              <ReportReadingView sub={activeSub} theme={theme} onComplete={() => markComplete(activeSub)} completed={isCompleted(activeSub.id)} />
            )}

            {/* ── LAB CADENCE ──────────────────────────────────── */}
            {activeSub?.type === "lab_cadence" && (
              <LabView sub={activeSub} theme={theme} accent="#818cf8" toolName="Cadence Innovus"
                code={labCode[activeSub.id] ?? activeSub.lab?.starterCode ?? ""}
                setCode={(v) => setLabCode(p => ({ ...p, [activeSub.id]: v }))}
                result={labResult[activeSub.id]}
                loading={labLoading[activeSub.id]}
                completed={isCompleted(activeSub.id)}
                onSubmit={() => submitLab(activeSub)}
              />
            )}

            {/* ── LAB SYNOPSYS ─────────────────────────────────── */}
            {activeSub?.type === "lab_synopsys" && (
              <LabView sub={activeSub} theme={theme} accent="#fb923c" toolName="Synopsys Fusion Compiler"
                code={labCode[activeSub.id] ?? activeSub.lab?.starterCode ?? ""}
                setCode={(v) => setLabCode(p => ({ ...p, [activeSub.id]: v }))}
                result={labResult[activeSub.id]}
                loading={labLoading[activeSub.id]}
                completed={isCompleted(activeSub.id)}
                onSubmit={() => submitLab(activeSub)}
              />
            )}

            {/* ── LAB ANALYSIS ─────────────────────────────────── */}
            {activeSub?.type === "lab_analysis" && (
              <LabView sub={activeSub} theme={theme} accent="#e879f9" toolName="Analysis Lab"
                code={labCode[activeSub.id] ?? activeSub.lab?.starterCode ?? ""}
                setCode={(v) => setLabCode(p => ({ ...p, [activeSub.id]: v }))}
                result={labResult[activeSub.id]}
                loading={labLoading[activeSub.id]}
                completed={isCompleted(activeSub.id)}
                onSubmit={() => submitLab(activeSub)}
              />
            )}

            {/* ── QUIZ ─────────────────────────────────────────── */}
            {activeSub?.type === "quiz" && (
              <QuizView sub={activeSub} theme={theme}
                answers={quizAnswers}
                submitted={quizSubmitted[activeSub.id]}
                completed={isCompleted(activeSub.id)}
                onAnswer={(qIdx, ans) => setQuizAnswers(p => ({ ...p, [`${activeSub.id}-${qIdx}`]: ans }))}
                onSubmit={() => submitQuiz(activeSub)}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {(allDone || celebration) && !celebrationClaimed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "14px 20px", background: `linear-gradient(135deg, ${theme.card}, rgba(0,0,0,0.9))`, borderTop: `1px solid ${theme.primary}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}
          >
            <div>
              <div style={{ color: theme.primary, fontWeight: 700, fontFamily: "'Orbitron',sans-serif", fontSize: "13px" }}>
                🏅 {levelData.badge} Unlocked!
              </div>
              <div style={{ color: "#888", fontSize: "11px", marginTop: "2px" }}>+{levelData.bonusXp} Bonus XP</div>
            </div>
            <button
              onClick={onLevelComplete}
              style={{ padding: "8px 18px", borderRadius: "10px", background: theme.gradient, border: "none", color: "#000", fontWeight: 700, fontSize: "12px", fontFamily: "'DM Mono',monospace", cursor: "pointer" }}
            >
              Claim & Continue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Sub-views ───────────────────────────────────────────────────────────────

function ConceptView({ sub, theme, onComplete, completed }: any) {
  return (
    <div>
      <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{sub.title}</h3>
      <p style={{ color: "#aaa", fontSize: "13px", lineHeight: 1.7, marginBottom: "16px" }}>{sub.content}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
        {sub.keyPoints?.map((kp: string, i: number) => (
          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: theme.primary, marginTop: "6px", flexShrink: 0 }} />
            <span style={{ color: "#ccc", fontSize: "12.5px", lineHeight: 1.6 }}>{kp}</span>
          </div>
        ))}
      </div>
      {!completed && (
        <button onClick={onComplete} style={{ padding: "9px 20px", borderRadius: "10px", background: theme.gradient, border: "none", color: "#000", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          Got it — Mark Complete <ChevronRight style={{ width: "14px", height: "14px" }} />
        </button>
      )}
      {completed && <div style={{ color: "#22c55e", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>✓ Completed</div>}
    </div>
  );
}

function ToolCommandsView({ sub, theme, toolTab, setToolTab, onComplete, completed }: any) {
  return (
    <div>
      <p style={{ color: "#aaa", fontSize: "13px", lineHeight: 1.7, marginBottom: "14px" }}>{sub.summary}</p>

      {/* Key points */}
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
        {sub.keyPoints?.map((kp: string, i: number) => (
          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34d399", marginTop: "6px", flexShrink: 0 }} />
            <span style={{ color: "#ccc", fontSize: "12px", lineHeight: 1.6, fontFamily: "'DM Mono',monospace" }}>{kp}</span>
          </div>
        ))}
      </div>

      {/* Tool toggle */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {(["cadence", "synopsys"] as const).map(tool => (
          <button key={tool} onClick={() => setToolTab(tool)} style={{
            padding: "5px 14px", borderRadius: "8px", fontSize: "11px", fontFamily: "'DM Mono',monospace", fontWeight: 700, cursor: "pointer",
            border: `1px solid ${toolTab === tool ? (tool === "cadence" ? "#818cf8" : "#fb923c") : "rgba(255,255,255,0.1)"}`,
            background: toolTab === tool ? (tool === "cadence" ? "rgba(129,140,248,0.15)" : "rgba(251,146,60,0.15)") : "transparent",
            color: toolTab === tool ? (tool === "cadence" ? "#818cf8" : "#fb923c") : "#666",
          }}>
            {tool === "cadence" ? "🔵 Cadence Innovus" : "🟠 Synopsys FC"}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${toolTab === "cadence" ? "rgba(129,140,248,0.3)" : "rgba(251,146,60,0.3)"}`, marginBottom: "16px" }}>
        <div style={{ background: toolTab === "cadence" ? "rgba(129,140,248,0.1)" : "rgba(251,146,60,0.1)", padding: "6px 12px", fontSize: "10px", fontFamily: "'DM Mono',monospace", color: toolTab === "cadence" ? "#818cf8" : "#fb923c", fontWeight: 700 }}>
          {toolTab === "cadence" ? "Cadence Innovus — Tcl" : "Synopsys Fusion Compiler — Tcl"}
        </div>
        <pre style={{ background: "#0a0a0f", margin: 0, padding: "14px", fontSize: "11.5px", color: "#e2e8f0", lineHeight: 1.7, overflowX: "auto", fontFamily: "'DM Mono',monospace" }}>
          {toolTab === "cadence" ? sub.cadence : sub.synopsys}
        </pre>
      </div>

      {!completed && (
        <button onClick={onComplete} style={{ padding: "9px 20px", borderRadius: "10px", background: theme.gradient, border: "none", color: "#000", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
          Studied Both Tools ✓
        </button>
      )}
      {completed && <div style={{ color: "#22c55e", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>✓ Completed</div>}
    </div>
  );
}

function ReportReadingView({ sub, theme, onComplete, completed }: any) {
  return (
    <div>
      <p style={{ color: "#aaa", fontSize: "13px", lineHeight: 1.7, marginBottom: "14px" }}>{sub.summary}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
        {sub.keyPoints?.map((kp: string, i: number) => (
          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", marginTop: "6px", flexShrink: 0 }} />
            <span style={{ color: "#ccc", fontSize: "12px", lineHeight: 1.6 }}>{kp}</span>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(245,158,11,0.25)", marginBottom: "16px" }}>
        <div style={{ background: "rgba(245,158,11,0.1)", padding: "6px 12px", fontSize: "10px", fontFamily: "'DM Mono',monospace", color: "#f59e0b", fontWeight: 700 }}>
          📄 Tool Report Output
        </div>
        <pre style={{ background: "#0a0a0f", margin: 0, padding: "14px", fontSize: "11px", color: "#e2e8f0", lineHeight: 1.7, overflowX: "auto", fontFamily: "'DM Mono',monospace", whiteSpace: "pre-wrap" }}>
          {sub.reportContent}
        </pre>
      </div>
      {!completed && (
        <button onClick={onComplete} style={{ padding: "9px 20px", borderRadius: "10px", background: theme.gradient, border: "none", color: "#000", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
          Report Understood ✓
        </button>
      )}
      {completed && <div style={{ color: "#22c55e", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>✓ Completed</div>}
    </div>
  );
}

function LabView({ sub, theme, accent, toolName, code, setCode, result, loading, completed, onSubmit }: any) {
  const [showHints, setShowHints] = useState(false);
  return (
    <div>
      {/* Instructions */}
      <div style={{ borderRadius: "10px", border: `1px solid ${accent}30`, background: `${accent}08`, padding: "12px 14px", marginBottom: "14px" }}>
        <div style={{ color: accent, fontSize: "10px", fontFamily: "'DM Mono',monospace", fontWeight: 700, marginBottom: "6px" }}>
          🔧 {toolName}
        </div>
        <pre style={{ color: "#ccc", fontSize: "11.5px", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontFamily: "'DM Mono',monospace" }}>
          {sub.lab?.instructions}
        </pre>
      </div>

      {/* Result */}
      {result && (
        <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${result.passed ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, background: result.passed ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)" }}>
          <div style={{ color: result.passed ? "#22c55e" : "#ef4444", fontWeight: 700, fontSize: "12px", marginBottom: "4px" }}>
            {result.passed ? "✅ All patterns matched — Lab Passed!" : "❌ Lab Failed"}
          </div>
          <div style={{ color: "#999", fontSize: "11px" }}>{result.feedback}</div>
        </div>
      )}

      {/* Monaco Editor */}
      <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${accent}40`, marginBottom: "12px" }}>
        <div style={{ background: `${accent}15`, padding: "6px 12px", fontSize: "10px", fontFamily: "'DM Mono',monospace", color: accent, fontWeight: 700 }}>
          Tcl Editor — Write your commands here
        </div>
        <Editor
          height="240px"
          defaultLanguage="tcl"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 10 }, lineNumbers: "on" }}
        />
      </div>

      {/* Hints */}
      <div style={{ marginBottom: "12px" }}>
        <button onClick={() => setShowHints(!showHints)} style={{ color: "#666", fontSize: "11px", fontFamily: "'DM Mono',monospace", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {showHints ? "▲ Hide hints" : "▼ Show hints"}
        </button>
        {showHints && (
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {sub.lab?.hints?.map((h: string, i: number) => (
              <div key={i} style={{ padding: "5px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#888", fontSize: "11px", fontFamily: "'DM Mono',monospace" }}>
                💡 {h}
              </div>
            ))}
          </div>
        )}
      </div>

      {!completed && (
        <button onClick={onSubmit} disabled={loading} style={{ padding: "9px 22px", borderRadius: "10px", background: loading ? "#333" : theme.gradient, border: "none", color: loading ? "#666" : "#000", fontWeight: 700, fontSize: "12px", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Evaluating..." : "Submit Lab →"}
        </button>
      )}
      {completed && <div style={{ color: "#22c55e", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>✓ Lab Passed</div>}
    </div>
  );
}

function QuizView({ sub, theme, answers, submitted, completed, onAnswer, onSubmit }: any) {
  const allAnswered = sub.quiz?.every((_: any, i: number) => answers[`${sub.id}-${i}`] !== undefined);
  return (
    <div>
      <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "18px" }}>{sub.summary}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
        {sub.quiz?.map((q: any, qi: number) => {
          const key = `${sub.id}-${qi}`;
          const selected = answers[key];
          return (
            <div key={qi}>
              <div style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                {qi + 1}. {q.q}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {q.options.map((opt: string, oi: number) => {
                  let bg = "rgba(255,255,255,0.03)";
                  let border = "rgba(255,255,255,0.08)";
                  let color = "#aaa";
                  if (selected === oi) { bg = `${theme.primary}15`; border = theme.primary; color = "#fff"; }
                  if (submitted) {
                    if (oi === q.answer) { bg = "rgba(34,197,94,0.1)"; border = "#22c55e"; color = "#22c55e"; }
                    else if (selected === oi) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; }
                  }
                  return (
                    <button key={oi} onClick={() => !submitted && onAnswer(qi, oi)} style={{ padding: "8px 12px", borderRadius: "8px", background: bg, border: `1px solid ${border}`, color, fontSize: "12.5px", textAlign: "left", cursor: submitted ? "default" : "pointer", transition: "all 0.15s" }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {!submitted && !completed && (
        <button onClick={onSubmit} disabled={!allAnswered} style={{ padding: "9px 22px", borderRadius: "10px", background: allAnswered ? theme.gradient : "#222", border: "none", color: allAnswered ? "#000" : "#555", fontWeight: 700, fontSize: "12px", cursor: allAnswered ? "pointer" : "not-allowed" }}>
          Submit Quiz →
        </button>
      )}
      {(submitted || completed) && (
        <div style={{ color: "#22c55e", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>
          {submitted && !completed ? "Some answers wrong — review and try again" : "✓ Quiz Passed"}
        </div>
      )}
    </div>
  );
}