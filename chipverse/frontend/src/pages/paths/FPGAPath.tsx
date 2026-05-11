import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, Play, ChevronRight, Star, FileText } from "lucide-react";
import { useUserContext } from "@/lib/user";
import { DOMAIN_THEMES } from "@/lib/themes";
import { ROADMAPS } from "@/lib/data";
import { RANKS } from "@/lib/ranks";
import CircuitBackground from "@/components/CircuitBackground";
import ParticleCanvas from "@/components/ParticleCanvas";
import SidebarWidget from "@/components/SidebarWidget";
import ProgressBar from "@/components/ProgressBar";
import RTLSubLevelPanel from "@/components/RTLSubLevelPanel";
import { cn } from "@/lib/utils";

const DOMAIN_ID = "fpga";
const STORAGE_KEY = "fpga_sublevel_progress";

type FPGAProgress = {
  completedSubLevels: string[];
  completedLevels: number[];
  claimedLevels: number[];
  totalXp: number;
};

function loadProgress(): FPGAProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { ...p, claimedLevels: p.claimedLevels ?? [] };
    }
  } catch {}
  return { completedSubLevels: [], completedLevels: [], claimedLevels: [], totalXp: 0 };
}

function saveProgress(p: FPGAProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

export default function FPGAPath() {
  const { profile, completeLevel, addXp } = useUserContext();
  const theme = DOMAIN_THEMES[DOMAIN_ID];
  const levels = ROADMAPS[DOMAIN_ID] || [];
  const completedIds = profile.completedLevels[DOMAIN_ID] || [];

  const [progress, setProgress] = useState<FPGAProgress>(loadProgress);
  const [fpgaSubLevels, setFpgaSubLevels] = useState<any[]>([]);
  const [activeLevelIdx, setActiveLevelIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/fpga-sublevels.json").then(r => r.json()).then(setFpgaSubLevels).catch(console.error);
  }, []);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const isPrevLevelFullyComplete = (idx: number): boolean => {
    if (idx === 0) return true;
    const prevLevel = levels[idx - 1];
    const prevSubData = fpgaSubLevels.find(d => d.levelId === prevLevel.id);
    if (!prevSubData) return false;
    return prevSubData.subLevels.every((sl: any) => progress.completedSubLevels.includes(sl.id));
  };

  const getStatus = (id: number, idx: number) => {
    if (progress.completedLevels.includes(id)) return "completed";
    if (isPrevLevelFullyComplete(idx)) return "active";
    return "locked";
  };

  const handleSubLevelComplete = (subLevelId: string, xp: number) => {
    setProgress(prev => {
      if (prev.completedSubLevels.includes(subLevelId)) return prev;
      return { ...prev, completedSubLevels: [...prev.completedSubLevels, subLevelId], totalXp: prev.totalXp + xp };
    });
    addXp(xp);
  };

  const handleLevelComplete = (levelId: number, bonusXp: number) => {
    completeLevel(DOMAIN_ID, levelId, bonusXp);
    setProgress(prev => ({
      ...prev,
      completedLevels: prev.completedLevels.includes(levelId) ? prev.completedLevels : [...prev.completedLevels, levelId],
      claimedLevels: prev.claimedLevels.includes(levelId) ? prev.claimedLevels : [...prev.claimedLevels, levelId],
      totalXp: prev.totalXp + bonusXp,
    }));
    setActiveLevelIdx(null);
  };

  const overallProgress = Math.round(((completedIds.length + progress.completedLevels.length) / levels.length) * 100);
  const activeLevel = activeLevelIdx !== null ? levels[activeLevelIdx] : null;
  const activeLevelData = activeLevelIdx !== null ? fpgaSubLevels.find(d => d.levelId === levels[activeLevelIdx].id) : null;

  return (
    <div className="min-h-screen pt-16 relative bg-black overflow-x-hidden">
      <CircuitBackground />
      <ParticleCanvas color={theme.primary} density={35} />

      <AnimatePresence>
        {activeLevelIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
            onClick={() => setActiveLevelIdx(null)}
            style={{ position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", cursor: "pointer" }} />
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="relative py-14 px-4 border-b border-white/10" style={{ background: theme.card }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Orbitron'] flex items-center gap-4">
              <theme.icon className="w-10 h-10" style={{ color: theme.primary }} />
              {theme.name}
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Master FPGA design — LUTs, FSMs, BRAM, DSP blocks, AXI, HLS, timing closure, and Zynq SoC development.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "999px", padding: "3px 12px", fontSize: "10.5px", fontFamily: "'DM Mono',monospace", color: theme.primary, fontWeight: 700 }}>{levels.length} Levels × 5 Sub-levels</div>
              <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "999px", padding: "3px 12px", fontSize: "10.5px", fontFamily: "'DM Mono',monospace", color: "#60a5fa", fontWeight: 700 }}>🔵 Xilinx Vivado</div>
              <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "999px", padding: "3px 12px", fontSize: "10.5px", fontFamily: "'DM Mono',monospace", color: "#818cf8", fontWeight: 700 }}>🟣 Intel Quartus</div>
              <div style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "999px", padding: "3px 12px", fontSize: "10.5px", fontFamily: "'DM Mono',monospace", color: "#a855f7", fontWeight: 700 }}>+{progress.totalXp} XP</div>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap items-start">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[150px]">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Progress</div>
              <div className="text-3xl font-bold text-white mb-3 font-mono">{overallProgress}%</div>
              <ProgressBar value={overallProgress} max={100} color={theme.primary} />
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[150px]">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Sub-levels</div>
              <div className="text-xl font-bold mt-2" style={{ color: theme.primary }}>{progress.completedSubLevels.length}/{levels.length * 5}</div>
            </div>
            <a href="/report/fpga" className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: theme.gradient, color: '#000', textDecoration: 'none', boxShadow: `0 0 20px ${theme.glow}55` }}>
              <FileText style={{ width: "16px", height: "16px" }} />
              View Skill Report
            </a>
          </div>
        </div>
      </div>

      <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: "9px 24px", textAlign: "center" }}>
        <span style={{ color: theme.primary, fontSize: "10.5px", fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
          💡 Click any active level — Concept → Syntax → Walkthrough → Lab (Verilog/SV) → Quiz
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">
        <div className="flex-1 relative">
          <div className="absolute left-12 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform -translate-x-px" />
          <div className="relative">
            {levels.map((level, idx) => {
              const status = getStatus(level.id, idx);
              const isLeft = idx % 2 === 0;
              const isActive = activeLevelIdx === idx;
              const levelSubData = fpgaSubLevels.find(d => d.levelId === level.id);
              const completedSubCount = levelSubData ? levelSubData.subLevels.filter((sl: any) => progress.completedSubLevels.includes(sl.id)).length : 0;

              return (
                <div key={level.id} className="relative">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.04 }}
                    className={cn("relative flex items-center w-full my-10", isLeft ? "justify-start md:justify-end md:pr-16" : "justify-start md:pl-16")}
                    style={{ zIndex: isActive ? 25 : 1 }}>
                    <div onClick={() => { if (status === "locked") return; setActiveLevelIdx(activeLevelIdx === idx ? null : idx); }}
                      className="absolute left-6 md:left-1/2 transform -translate-x-1/2 transition-all duration-300 hover:scale-110"
                      style={{ zIndex: isActive ? 26 : 10, width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? theme.gradient : "rgba(0,0,0,0.8)", border: `3px solid ${status === "locked" ? "rgba(255,255,255,0.1)" : isActive ? theme.primary : theme.border}`, boxShadow: isActive ? `0 0 28px ${theme.glow}, 0 0 60px ${theme.glow}` : status === "active" ? `0 0 14px ${theme.glow}` : "none", cursor: status === "locked" ? "not-allowed" : "pointer" }}>
                      {status === "locked" && <Lock style={{ width: "17px", height: "17px", color: "#555" }} />}
                      {status === "completed" && <Check style={{ width: "19px", height: "19px", color: theme.primary }} />}
                      {status === "active" && !isActive && <Play style={{ width: "17px", height: "17px", marginLeft: "2px", color: theme.primary }} />}
                      {status === "active" && isActive && <ChevronRight style={{ width: "19px", height: "19px", color: "#000" }} />}
                    </div>
                    <motion.div whileHover={status !== "locked" ? { y: -3 } : {}}
                      onClick={() => { if (status === "locked") return; setActiveLevelIdx(activeLevelIdx === idx ? null : idx); }}
                      style={{ marginLeft: "5rem", width: "calc(100% - 5rem)", padding: "15px 17px", borderRadius: "17px", background: isActive ? `linear-gradient(135deg, ${theme.card}, rgba(0,0,0,0.5))` : status === "completed" ? theme.card : "rgba(255,255,255,0.025)", border: `1px solid ${isActive ? theme.primary : status === "locked" ? "rgba(255,255,255,0.05)" : theme.border}`, boxShadow: isActive ? `0 0 30px ${theme.glow}` : "none", cursor: status === "locked" ? "not-allowed" : "pointer", opacity: status === "locked" ? 0.6 : 1, transition: "all 0.3s ease", position: "relative", overflow: "hidden", zIndex: isActive ? 26 : 1 }}
                      className="md:ml-0 md:w-[calc(50%-4rem)]">
                      {isActive && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: theme.gradient }} />}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-base text-white font-['Orbitron']">{level.title}</h4>
                        <span className="text-xs font-mono px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/10 shrink-0 ml-2">{level.xp} XP</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{level.difficulty} · {level.hours}h</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {level.topics.slice(0, 3).map((topic: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/8 text-gray-400">{topic}</span>
                        ))}
                        {level.topics.length > 3 && <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/8 text-gray-500">+{level.topics.length - 3}</span>}
                      </div>
                      {status !== "locked" && levelSubData && (
                        <div style={{ marginTop: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ color: "#555", fontSize: "9px", fontFamily: "'DM Mono',monospace" }}>Sub-levels</span>
                            <span style={{ color: theme.primary, fontSize: "9px", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{completedSubCount}/5</span>
                          </div>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {levelSubData.subLevels.map((sl: any, i: number) => {
                              const done = progress.completedSubLevels.includes(sl.id);
                              return <div key={i} style={{ flex: 1, height: "3.5px", borderRadius: "999px", background: done ? theme.gradient : "rgba(255,255,255,0.08)", transition: "all 0.4s", boxShadow: done ? `0 0 3px ${theme.glow}` : "none" }} />;
                            })}
                          </div>
                        </div>
                      )}
                      {isActive && <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "5px", color: theme.primary, fontSize: "9.5px", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}><Star style={{ width: "9px", height: "9px" }} /> Sub-levels expanded →</div>}
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <SidebarWidget title="Rank Ladder">
            <div className="space-y-4">
              {RANKS.map((rank, i) => {
                const reqLevels = i * 2;
                const totalCompleted = completedIds.length + progress.completedLevels.length;
                const isUnlocked = totalCompleted >= reqLevels;
                const isNext = totalCompleted >= reqLevels - 2 && !isUnlocked;
                return (
                  <div key={rank} className="flex items-center gap-4">
                    <div className="w-6 flex justify-center">
                      {isUnlocked ? <Check className="w-5 h-5 text-green-500" /> : isNext ? <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                    </div>
                    <div className={cn("text-sm font-medium", isUnlocked ? "text-white" : isNext ? "text-gray-300" : "text-gray-600")}>{rank}</div>
                  </div>
                );
              })}
            </div>
          </SidebarWidget>

          {progress.completedLevels.length > 0 && (
            <SidebarWidget title="Badges Earned">
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {fpgaSubLevels.filter(d => progress.completedLevels.includes(d.levelId)).map(d => (
                  <div key={d.levelId} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 10px", borderRadius: "9px", background: theme.card, border: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: "14px" }}>🏅</span>
                    <span style={{ color: theme.primary, fontSize: "11px", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{d.badge}</span>
                  </div>
                ))}
              </div>
            </SidebarWidget>
          )}

          <SidebarWidget title="Skill Report">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ color: "#888", fontSize: "11px", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>
                View your full skill breakdown, radar chart, and badges — shareable + downloadable as PDF.
              </p>
              <a href="/report/fpga" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", background: theme.gradient, color: "#000", fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: 700, textDecoration: "none", boxShadow: `0 0 14px ${theme.glow}55` }}>
                <FileText style={{ width: "13px", height: "13px" }} />
                View My Report →
              </a>
            </div>
          </SidebarWidget>
        </div>
      </div>

      <AnimatePresence>
        {activeLevelIdx !== null && activeLevelData && activeLevel && (
          <RTLSubLevelPanel levelData={activeLevelData} levelTitle={activeLevel.title} levelIndex={activeLevelIdx} theme={theme} domain="fpga"
            completedSubLevels={progress.completedSubLevels} celebrationClaimed={progress.claimedLevels.includes(activeLevel.id)}
            onSubLevelComplete={handleSubLevelComplete} onLevelComplete={() => handleLevelComplete(activeLevel.id, activeLevelData.bonusXp)} onClose={() => setActiveLevelIdx(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}