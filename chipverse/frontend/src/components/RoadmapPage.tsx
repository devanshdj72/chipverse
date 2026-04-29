import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/lib/user";
import { DOMAIN_THEMES } from "@/lib/themes";
import { ROADMAPS, DomainId, Level } from "@/lib/data";
import { RANKS } from "@/lib/ranks";
import CircuitBackground from "./CircuitBackground";
import ParticleCanvas from "./ParticleCanvas";
import { RoadmapNode } from "./RoadmapNode";
import SidebarWidget from "./SidebarWidget";
import { X, PlayCircle, Award, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "./ProgressBar";

export default function RoadmapPage({ domainId }: { domainId: DomainId }) {
  const { profile, completeLevel } = useUserContext();
  const theme = DOMAIN_THEMES[domainId];
  const levels = ROADMAPS[domainId] || [];
  const completedIds = profile.completedLevels[domainId] || [];
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  if (!theme || !levels.length) return <div className="text-white p-20 text-center text-xl">Domain not found</div>;

  const progress = Math.round((completedIds.length / levels.length) * 100);

  const getStatus = (id: number, idx: number) => {
    if (completedIds.includes(id)) return "completed";
    if (idx === 0 || completedIds.includes(levels[idx - 1].id)) return "active";
    return "locked";
  };

  const handleComplete = () => {
    if (selectedLevel) {
      completeLevel(domainId, selectedLevel.id, selectedLevel.xp);
      setSelectedLevel(null);
    }
  };

  return (
    <div className="min-h-screen pt-16 relative bg-black">
      <CircuitBackground />
      <ParticleCanvas color={theme.primary} density={40} />

      {/* Hero */}
      <div className="relative py-16 px-4 border-b border-white/10" style={{ background: theme.card }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Orbitron'] flex items-center gap-4">
              <theme.icon className="w-10 h-10" style={{ color: theme.primary }} />
              {theme.name}
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Master {theme.name} from fundamentals to advanced industry-grade projects.
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[160px]">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Progress</div>
              <div className="text-3xl font-bold text-white mb-3 font-mono">{progress}%</div>
              <ProgressBar value={progress} max={100} color={theme.primary} />
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[160px]">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Domain Rank</div>
              <div className="text-xl font-bold mt-2 leading-tight" style={{ color: theme.primary }}>
                {RANKS[Math.min(Math.floor(completedIds.length / 2), RANKS.length - 1)]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Roadmap */}
        <div className="flex-1 relative">
          {/* Vertical line */}
          <div className="absolute left-12 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 transform -translate-x-1/2 rounded-full" />
          
          <div className="relative">
            {levels.map((level, idx) => (
              <RoadmapNode
                key={level.id}
                level={level}
                theme={theme}
                status={getStatus(level.id, idx)}
                index={idx}
                onClick={() => setSelectedLevel(level)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <SidebarWidget title="Rank Ladder">
            <div className="space-y-5 relative">
              {RANKS.map((rank, i) => {
                const reqLevels = i * 2;
                const isUnlocked = completedIds.length >= reqLevels;
                const isNext = completedIds.length >= reqLevels - 2 && !isUnlocked;
                
                return (
                  <div key={rank} className="flex items-center gap-4">
                    <div className="w-6 flex justify-center">
                      {isUnlocked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : isNext ? (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary, boxShadow: `0 0 10px ${theme.glow}` }} />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                      )}
                    </div>
                    <div className={cn("text-sm font-medium", isUnlocked ? "text-white" : isNext ? "text-gray-300" : "text-gray-600")}>
                      {rank}
                    </div>
                  </div>
                );
              })}
            </div>
          </SidebarWidget>
        </div>
      </div>

      {/* Level Modal */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              style={{ borderColor: theme.border }}
            >
              <div className="p-6 border-b border-white/10 relative" style={{ background: theme.card }}>
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="text-sm font-mono mb-2 tracking-wider" style={{ color: theme.primary }}>LEVEL {selectedLevel.level}</div>
                <h2 className="text-2xl font-bold text-white mb-3">{selectedLevel.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>{selectedLevel.difficulty}</span>
                  <span>•</span>
                  <span>{selectedLevel.hours} Hours</span>
                  <span>•</span>
                  <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">+{selectedLevel.xp} XP</span>
                </div>
              </div>
              
              <div className="p-6 space-y-8 bg-black/40">
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" /> Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLevel.topics.map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-gray-400" /> Lab Mission
                  </h3>
                  <div className="p-5 rounded-xl bg-black border border-white/10 flex items-start gap-4">
                    <PlayCircle className="w-6 h-6 mt-0.5" style={{ color: theme.primary }} />
                    <div>
                      <div className="text-white font-medium mb-1 text-lg">{selectedLevel.lab}</div>
                      <div className="text-gray-400 text-sm capitalize">{selectedLevel.labType} task</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={completedIds.includes(selectedLevel.id)}
                    className="px-6 py-3 rounded-xl font-bold text-black transition-all flex items-center gap-2 hover:opacity-90"
                    style={{ 
                      background: completedIds.includes(selectedLevel.id) ? '#333' : theme.gradient,
                      color: completedIds.includes(selectedLevel.id) ? '#888' : '#000',
                      cursor: completedIds.includes(selectedLevel.id) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {completedIds.includes(selectedLevel.id) ? "Completed" : "Mark Complete"} 
                    {!completedIds.includes(selectedLevel.id) && <Award className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
