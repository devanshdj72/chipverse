import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Send, Lightbulb, CheckCircle2, XCircle,
  RotateCcw, ChevronDown, ChevronUp, Loader2, Code2,
} from "lucide-react";
import { DomainTheme } from "@/lib/themes";
import { RTLLabData } from "@/lib/data";
import api from "@/lib/api";

interface LabResult {
  passed: boolean;
  score: number;
  total: number;
  feedback: string;
  hints: string[];
  xp: number;
}

interface LabEditorProps {
  labData: RTLLabData;
  theme: DomainTheme;
  labId: string;
  isCompleted: boolean;
  xp: number;
  onComplete: () => void;
}

export default function LabEditor({
  labData, theme, labId, isCompleted, xp, onComplete,
}: LabEditorProps) {
  const [code, setCode] = useState(labData.starterCode);
  const [result, setResult] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const editorRef = useRef<any>(null);

  const handleReset = () => {
    setCode(labData.starterCode);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (loading || isCompleted) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.lab.evaluate({
        labId,
        code,
        requiredPatterns: labData.requiredPatterns,
        forbiddenPatterns: labData.forbiddenPatterns,
        xp,
      });
      setResult(res.data);
      if (res.data.passed) {
        setTimeout(() => onComplete(), 800);
      }
    } catch (err) {
      setResult({
        passed: false,
        score: 0,
        total: labData.requiredPatterns.length,
        feedback: "Submission failed. Check your connection and try again.",
        hints: [],
        xp: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const revealNextHint = () => {
    if (hintIdx < labData.hints.length - 1) setHintIdx((i) => i + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "0" }}>

      {/* Instructions toggle */}
      <div
        onClick={() => setShowInstructions((v) => !v)}
        style={{
          padding: "10px 16px", cursor: "pointer",
          background: `${theme.card}`,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Code2 style={{ width: "14px", height: "14px", color: theme.primary }} />
          <span style={{ color: theme.primary, fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Lab Instructions
          </span>
        </div>
        {showInstructions
          ? <ChevronUp style={{ width: "14px", height: "14px", color: "#888" }} />
          : <ChevronDown style={{ width: "14px", height: "14px", color: "#888" }} />
        }
      </div>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              padding: "14px 16px",
              background: "rgba(0,0,0,0.4)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "180px", overflowY: "auto",
              scrollbarWidth: "thin",
            }}>
              <pre style={{
                color: "#d4d4d4", fontSize: "11.5px", fontFamily: "'DM Mono', monospace",
                lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0,
              }}>
                {labData.instructions}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monaco Editor */}
      <div style={{ flex: 1, minHeight: "240px", position: "relative" }}>
        <Editor
          height="100%"
          language={labData.editorLanguage}
          value={code}
          onChange={(val) => setCode(val ?? "")}
          onMount={(editor) => { editorRef.current = editor; }}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'DM Mono', 'Courier New', monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          }}
        />
      </div>

      {/* Result panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              padding: "12px 16px",
              background: result.passed ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              borderTop: `1px solid ${result.passed ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                {result.passed
                  ? <CheckCircle2 style={{ width: "16px", height: "16px", color: "#4ade80" }} />
                  : <XCircle style={{ width: "16px", height: "16px", color: "#f87171" }} />
                }
                <span style={{ color: result.passed ? "#4ade80" : "#f87171", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                  {result.passed ? `PASSED — +${result.xp} XP Earned!` : `FAILED — ${result.score}/${result.total} patterns matched`}
                </span>
              </div>
              <p style={{ color: "#bbb", fontSize: "11.5px", fontFamily: "'DM Mono', monospace", margin: 0, lineHeight: 1.6 }}>
                {result.feedback}
              </p>
              {!result.passed && result.hints.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  {result.hints.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span style={{ color: "#f59e0b", fontSize: "10px" }}>💡</span>
                      <span style={{ color: "#d4a017", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hints panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{
              padding: "12px 16px",
              background: "rgba(245,158,11,0.06)",
              borderTop: "1px solid rgba(245,158,11,0.2)",
            }}>
              <div style={{ color: "#f59e0b", fontSize: "9.5px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                Hints ({hintIdx + 1}/{labData.hints.length})
              </div>
              {labData.hints.slice(0, hintIdx + 1).map((hint, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ color: "#f59e0b" }}>💡</span>
                  <span style={{ color: "#e0c070", fontSize: "11.5px", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>{hint}</span>
                </div>
              ))}
              {hintIdx < labData.hints.length - 1 && (
                <button onClick={revealNextHint}
                  style={{ marginTop: "8px", padding: "5px 12px", borderRadius: "7px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: "11px", fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                  Next hint →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <div style={{
        padding: "10px 14px", display: "flex", gap: "8px", alignItems: "center",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.5)", flexShrink: 0,
      }}>
        {/* Reset */}
        <button onClick={handleReset}
          style={{ padding: "7px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: "11px", fontFamily: "'DM Mono', monospace", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <RotateCcw style={{ width: "11px", height: "11px" }} /> Reset
        </button>

        {/* Hints toggle */}
        <button onClick={() => setShowHints((v) => !v)}
          style={{ padding: "7px 12px", borderRadius: "9px", background: showHints ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${showHints ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`, color: showHints ? "#f59e0b" : "#888", fontSize: "11px", fontFamily: "'DM Mono', monospace", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <Lightbulb style={{ width: "11px", height: "11px" }} /> Hints
        </button>

        <div style={{ flex: 1 }} />

        {/* Completed state */}
        {isCompleted ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <CheckCircle2 style={{ width: "13px", height: "13px", color: "#4ade80" }} />
            <span style={{ color: "#4ade80", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>Completed</span>
          </div>
        ) : (
          /* Submit button */
          <button
            onClick={handleSubmit}
            disabled={loading || isCompleted}
            style={{
              padding: "8px 20px", borderRadius: "10px",
              background: loading ? "rgba(255,255,255,0.1)" : theme.gradient,
              border: "none", color: loading ? "#888" : "#000",
              fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 0 14px ${theme.glow}`,
              display: "flex", alignItems: "center", gap: "6px",
              letterSpacing: "0.03em",
            }}
          >
            {loading
              ? <><Loader2 style={{ width: "13px", height: "13px" }} className="animate-spin" /> Evaluating...</>
              : <><Send style={{ width: "13px", height: "13px" }} /> Submit (+{xp} XP)</>
            }
          </button>
        )}
      </div>
    </div>
  );
}