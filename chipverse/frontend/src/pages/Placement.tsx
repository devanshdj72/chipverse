import { useState, useRef, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface RoleScore {
  role: string;
  domain: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  color: string;
}

interface AnalysisResult {
  overallScore: number;
  overallGrade: string;
  summary: string;
  topRole: RoleScore;
  allRoles: RoleScore[];
  suggestions: string[];
  strengths: string[];
}

// ── Domain colors (matching CHIPVERSE theme) ────────────────────────────────
const DOMAIN_COLORS: Record<string, string> = {
  "Web Development": "#6C63FF",
  "Data Science": "#00D9C0",
  "Machine Learning": "#FF6B9D",
  "Cloud & DevOps": "#F59E0B",
  "Cybersecurity": "#EF4444",
  "Mobile Development": "#10B981",
  "Blockchain": "#8B5CF6",
  "UI/UX Design": "#F97316",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function getGradeColor(score: number) {
  if (score >= 80) return "#00D9C0";
  if (score >= 60) return "#6C63FF";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function getGrade(score: number) {
  if (score >= 80) return "S";
  if (score >= 65) return "A";
  if (score >= 50) return "B";
  if (score >= 35) return "C";
  return "D";
}

// ── Sub-components ─────────────────────────────────────────────────────────
function CircularProgress({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getGradeColor(score);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color, letterSpacing: "-1px" }}>
          {score}
        </span>
        <span style={{ fontSize: size * 0.12, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function ScoreBar({ score, color, label }: { score: number; color: string; label: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color, fontWeight: 700 }}>{score}%</span>
      </div>
      <div style={{
        height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%", width: `${score}%`, borderRadius: 3,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: "width 1s cubic-bezier(.4,0,.2,1)"
        }} />
      </div>
    </div>
  );
}

function KeywordPill({ word, matched }: { word: string; matched: boolean }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, margin: "3px",
      background: matched ? "rgba(0,217,192,0.15)" : "rgba(239,68,68,0.12)",
      color: matched ? "#00D9C0" : "#EF4444",
      border: `1px solid ${matched ? "rgba(0,217,192,0.3)" : "rgba(239,68,68,0.25)"}`,
      letterSpacing: "0.3px"
    }}>
      {matched ? "✓" : "✗"} {word}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Placement() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleScore | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload handlers ──────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setResult(null);
      setError("");
    } else {
      setError("Only PDF files are supported.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setError("");
    }
  };

  // ── Analyze ──────────────────────────────────────────────────────────────
  const analyzeResume = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError("");
    setAnalyzeProgress(0);

    // Fake progress animation while API processes
    const progressTimer = setInterval(() => {
      setAnalyzeProgress(p => Math.min(p + Math.random() * 12, 90));
    }, 400);

    try {
      const formData = new FormData();
      formData.append("resume", file);

     const token = document.cookie
  .split("; ")
  .find(row => row.startsWith("accessToken="))
  ?.split("=")[1];

const response = await fetch("http://localhost:5000/api/placement/analyze", {
  method: "POST",
  body: formData,
  credentials: "include",
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});
      clearInterval(progressTimer);
      setAnalyzeProgress(100);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Analysis failed");
      }

      const data = await response.json();
      setTimeout(() => {
        setResult(data.data);
        setSelectedRole(data.data.topRole);
        setIsAnalyzing(false);
      }, 400);
    } catch (err: any) {
      clearInterval(progressTimer);
      setError(err.message || "Something went wrong. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setSelectedRole(null);
    setAnalyzeProgress(0);
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0D0D1A 0%, #0A0A18 50%, #0D0D1A 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#fff",
      padding: "0",
    } as React.CSSProperties,

    hero: {
      padding: "60px 24px 40px",
      textAlign: "center" as const,
      position: "relative" as const,
    },

    heroGlow: {
      position: "absolute" as const,
      top: 0, left: "50%", transform: "translateX(-50%)",
      width: 600, height: 300,
      background: "radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)",
      pointerEvents: "none" as const,
    },

    badge: {
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)",
      borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600,
      color: "#a29bfe", letterSpacing: "0.5px", marginBottom: 20,
    },

    title: {
      fontSize: "clamp(32px, 5vw, 52px)",
      fontWeight: 900, letterSpacing: "-2px",
      lineHeight: 1.1, marginBottom: 16,
      background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
      WebkitBackgroundClip: "text" as const,
      WebkitTextFillColor: "transparent",
    },

    subtitle: {
      fontSize: 16, color: "rgba(255,255,255,0.5)",
      maxWidth: 480, margin: "0 auto", lineHeight: 1.7,
    },

    container: {
      maxWidth: 900, margin: "0 auto", padding: "0 24px 80px",
    },

    card: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, padding: 32,
      backdropFilter: "blur(12px)",
    },

    uploadZone: (drag: boolean) => ({
      border: `2px dashed ${drag ? "#6C63FF" : "rgba(255,255,255,0.12)"}`,
      borderRadius: 16, padding: "48px 24px",
      textAlign: "center" as const,
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: drag ? "rgba(108,99,255,0.06)" : "rgba(255,255,255,0.02)",
    }),

    btn: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "linear-gradient(135deg, #6C63FF, #8B5CF6)",
      color: "#fff", border: "none", borderRadius: 12,
      padding: "14px 28px", fontSize: 15, fontWeight: 700,
      cursor: "pointer", transition: "all 0.2s ease",
      boxShadow: "0 4px 24px rgba(108,99,255,0.3)",
    },

    btnOutline: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "transparent", color: "rgba(255,255,255,0.6)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
      padding: "12px 24px", fontSize: 14, fontWeight: 600,
      cursor: "pointer", transition: "all 0.2s ease",
    },

    sectionLabel: {
      fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
      color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const,
      marginBottom: 16,
    },

    grid2: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
    },

    roleCard: (active: boolean, color: string) => ({
      background: active ? `${color}18` : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14, padding: "16px 18px", cursor: "pointer",
      transition: "all 0.2s ease",
    }),

    suggestionItem: {
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    },

    strengthItem: {
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "10px 0",
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.badge}>
          <span>⚡</span> PLACEMENT PORTAL
        </div>
        <h1 style={styles.title}>AI Resume Analyzer</h1>
        <p style={styles.subtitle}>
          Upload your resume. Our AI will score it across every domain, match keywords, 
          and guide you to your best-fit role.
        </p>
      </div>

      <div style={styles.container}>

        {/* ── Upload Section ── */}
        {!result && (
          <div style={styles.card}>
            {/* Drop Zone */}
            <div
              style={styles.uploadZone(isDragging)}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef} type="file" accept=".pdf"
                style={{ display: "none" }} onChange={handleFileChange}
              />
              {!file ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                    Drop your resume here
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
                    PDF format only • Max 5MB
                  </div>
                  <span style={{
                    background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)",
                    color: "#a29bfe", padding: "8px 20px", borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    Browse Files
                  </span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{file.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    {(file.size / 1024).toFixed(1)} KB • Ready to analyze
                  </div>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 16, padding: "12px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                color: "#EF4444", fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Progress */}
            {isAnalyzing && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    🤖 AI analyzing your resume...
                  </span>
                  <span style={{ fontSize: 13, color: "#6C63FF", fontWeight: 700 }}>
                    {Math.round(analyzeProgress)}%
                  </span>
                </div>
                <div style={{
                  height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", width: `${analyzeProgress}%`, borderRadius: 2,
                    background: "linear-gradient(90deg, #6C63FF, #00D9C0)",
                    transition: "width 0.4s ease"
                  }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
                  Matching keywords · Scoring domains · Generating recommendations
                </div>
              </div>
            )}

            {/* CTA */}
            {file && !isAnalyzing && (
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button style={styles.btn} onClick={analyzeResume}>
                  ⚡ Analyze Resume
                </button>
                <button style={styles.btnOutline} onClick={reset}>
                  ✕ Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Results Section ── */}
        {result && (
          <div>
            {/* Top strip */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 24,
            }}>
              <div>
                <div style={styles.sectionLabel}>Analysis Complete</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                  Your Resume Report
                </h2>
              </div>
              <button style={styles.btnOutline} onClick={reset}>
                ↩ Analyze Another
              </button>
            </div>

            {/* Overall Score + Top Role */}
            <div style={{
              ...styles.card,
              display: "grid", gridTemplateColumns: "auto 1fr", gap: 40,
              alignItems: "center", marginBottom: 20,
              background: `linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,217,192,0.04))`,
              border: "1px solid rgba(108,99,255,0.2)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <CircularProgress score={result.overallScore} size={130} />
                <div style={{
                  padding: "4px 16px", borderRadius: 20, fontWeight: 800,
                  fontSize: 18, letterSpacing: "1px",
                  background: `${getGradeColor(result.overallScore)}22`,
                  color: getGradeColor(result.overallScore),
                  border: `1px solid ${getGradeColor(result.overallScore)}40`,
                }}>
                  Grade {result.overallGrade}
                </div>
              </div>

              <div>
                <div style={styles.sectionLabel}>Best Match Role</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" }}>
                  {result.topRole.role}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: `${result.topRole.color}18`,
                  border: `1px solid ${result.topRole.color}40`,
                  color: result.topRole.color, borderRadius: 8,
                  padding: "4px 12px", fontSize: 13, fontWeight: 600, marginBottom: 14,
                }}>
                  {result.topRole.domain}
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Role Scores */}
            <div style={{ ...styles.card, marginBottom: 20 }}>
              <div style={styles.sectionLabel}>Domain Match Scores</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {result.allRoles.map(r => (
                  <div
                    key={r.role}
                    style={styles.roleCard(selectedRole?.role === r.role, r.color)}
                    onClick={() => setSelectedRole(r)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{r.role}</div>
                        <div style={{ fontSize: 11, color: r.color, fontWeight: 600, marginTop: 2 }}>
                          {r.domain}
                        </div>
                      </div>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${r.color}22`, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, color: r.color,
                      }}>
                        {getGrade(r.score)}
                      </div>
                    </div>
                    <ScoreBar score={r.score} color={r.color} label={`${r.score}% match`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Detail for Selected Role */}
            {selectedRole && (
              <div style={{ ...styles.card, marginBottom: 20 }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 20,
                }}>
                  <div>
                    <div style={styles.sectionLabel}>Keyword Analysis</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedRole.role}</div>
                  </div>
                  <div style={{
                    padding: "6px 14px", borderRadius: 10,
                    background: `${selectedRole.color}18`,
                    border: `1px solid ${selectedRole.color}40`,
                    color: selectedRole.color, fontWeight: 700, fontSize: 15,
                  }}>
                    {selectedRole.score}% match
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#00D9C0", marginBottom: 10, letterSpacing: "0.5px" }}>
                      ✓ MATCHED KEYWORDS ({selectedRole.matchedKeywords.length})
                    </div>
                    <div>
                      {selectedRole.matchedKeywords.map(k => <KeywordPill key={k} word={k} matched />)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 10, letterSpacing: "0.5px" }}>
                      ✗ MISSING KEYWORDS ({selectedRole.missingKeywords.length})
                    </div>
                    <div>
                      {selectedRole.missingKeywords.map(k => <KeywordPill key={k} word={k} matched={false} />)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths + Suggestions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Strengths */}
              <div style={styles.card}>
                <div style={styles.sectionLabel}>Your Strengths</div>
                {result.strengths.map((s, i) => (
                  <div key={i} style={styles.strengthItem}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "rgba(0,217,192,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                    }}>⭐</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{s}</div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div style={styles.card}>
                <div style={styles.sectionLabel}>Improvement Suggestions</div>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={styles.suggestionItem}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "rgba(108,99,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#6C63FF",
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* XP earned banner */}
            <div style={{
              ...styles.card,
              background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(139,92,246,0.1))",
              border: "1px solid rgba(108,99,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  🎉 Resume analyzed successfully!
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Keep improving your resume to unlock better domain matches.
                </div>
              </div>
              <div style={{
                background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.3)",
                borderRadius: 12, padding: "8px 18px", fontWeight: 800,
                fontSize: 18, color: "#a29bfe",
              }}>
                +{Math.round(result.overallScore / 5)} XP
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}