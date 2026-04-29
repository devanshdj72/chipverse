import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Timer, Zap, Shield, Trophy } from "lucide-react";
import { DomainTheme } from "@/lib/themes";
import { Level } from "@/lib/data";

const BOSS_QUESTIONS: Record<string, { q: string; options: string[]; answer: number }[]> = {
  rtl: [
    { q: "What is the critical path in a digital circuit?", options: ["Shortest path", "Longest timing path", "Power path", "Reset path"], answer: 1 },
    { q: "What does synthesis convert RTL into?", options: ["GDSII", "Gate netlist", "Bitstream", "Schematic"], answer: 1 },
    { q: "What is a latch vs flip-flop?", options: ["Same thing", "Latch is level-sensitive, FF is edge-sensitive", "FF is level-sensitive", "No difference"], answer: 1 },
    { q: "What causes metastability?", options: ["Wrong clock", "Setup/hold violation", "Power noise", "Routing congestion"], answer: 1 },
    { q: "What is clock gating used for?", options: ["Faster clock", "Power reduction", "Better timing", "Area reduction"], answer: 1 },
  ],
  verification: [
    { q: "What does UVM stand for?", options: ["Universal Verification Methodology", "Unified VM Model", "Unit Verification Method", "Universal VLSI Model"], answer: 0 },
    { q: "What is functional coverage?", options: ["Code coverage", "Measuring design space exercised", "Bug count", "Simulation speed"], answer: 1 },
    { q: "What is a scoreboard in UVM?", options: ["A leaderboard", "Checks DUT output vs expected", "Measures coverage", "Counts errors"], answer: 1 },
    { q: "What does SVA stand for?", options: ["SystemVerilog Assertions", "Standard Verification Architecture", "Signal Value Analysis", "Simulation Value Audit"], answer: 0 },
    { q: "What is a sequence in UVM?", options: ["A list of tasks", "A series of transactions sent to DUT", "A coverage group", "A monitor"], answer: 1 },
  ],
  default: [
    { q: "What does VLSI stand for?", options: ["Very Large Scale Integration", "Virtual Logic System Interface", "Voltage Level Signal Input", "Variable Length Signal Integration"], answer: 0 },
    { q: "What is RTL design?", options: ["Real Time Logic", "Register Transfer Level design", "Resistor Transistor Logic", "Runtime Level Transfer"], answer: 1 },
    { q: "What is a flip-flop?", options: ["A combinational element", "A sequential storage element", "A logic gate", "A clock buffer"], answer: 1 },
    { q: "What does DRC stand for?", options: ["Design Rule Check", "Digital Register Count", "Data Routing Check", "Device Rule Compliance"], answer: 0 },
    { q: "What is tapeout?", options: ["Testing on FPGA", "Sending final design to fabrication", "Writing testbench", "Synthesis step"], answer: 1 },
  ],
};

interface BossBattleProps {
  domainId: string;
  theme: DomainTheme;
  bossLevel: Level;
  onClose: () => void;
  onVictory: () => void;
}

const TIME_PER_QUESTION = 15;

export default function BossBattle({ domainId, theme, bossLevel, onClose, onVictory }: BossBattleProps) {
  const questions = BOSS_QUESTIONS[domainId] || BOSS_QUESTIONS.default;
  const [phase, setPhase] = useState<"intro" | "battle" | "victory" | "defeat">("intro");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);

  const question = questions[current];

  // Timer
  useEffect(() => {
    if (phase !== "battle" || showAnswer) return;
    if (timeLeft <= 0) {
      handleSelect(-1); // timeout = wrong
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, showAnswer]);

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    const correct = idx === question.answer;
    setAnswers(prev => [...prev, correct]);

    if (correct) {
      setBossHp(hp => Math.max(0, hp - 20));
    } else {
      setPlayerHp(hp => Math.max(0, hp - 20));
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      const score = answers.filter(Boolean).length + (selected === question.answer ? 1 : 0);
      if (score >= 3) setPhase("victory");
      else setPhase("defeat");
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowAnswer(false);
      setTimeLeft(TIME_PER_QUESTION);
    }
  };

  const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : theme.primary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-gray-950 border rounded-2xl overflow-hidden"
        style={{ borderColor: theme.primary, boxShadow: `0 0 40px ${theme.glow}` }}
      >
        {/* Intro */}
        {phase === "intro" && (
          <div className="p-8 text-center space-y-6">
            <div className="text-6xl animate-bounce">⚔️</div>
            <div>
              <div className="text-xs font-mono tracking-widest text-red-400 mb-2">BOSS BATTLE</div>
              <h2 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">{bossLevel.title}</h2>
              <p className="text-gray-400 text-sm">Answer 3 out of 5 questions correctly to defeat the boss and earn <span className="text-yellow-400 font-bold">+{bossLevel.xp} XP</span></p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["⏱️", `${TIME_PER_QUESTION}s`, "Per Question"], ["❓", "5", "Questions"], ["🎯", "3/5", "To Win"]].map(([icon, val, label]) => (
                <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-white font-bold">{val}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5">
                Retreat
              </button>
              <button
                onClick={() => setPhase("battle")}
                className="flex-1 py-3 rounded-xl font-bold text-black"
                style={{ background: theme.gradient }}
              >
                ⚔️ Fight!
              </button>
            </div>
          </div>
        )}

        {/* Battle */}
        {phase === "battle" && (
          <div className="p-6 space-y-4">
            {/* HP Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-400">🧑 You</span>
                  <span className="text-green-400">{playerHp}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${playerHp}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">👾 Boss</span>
                  <span className="text-red-400">{bossHp}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${bossHp}%` }} />
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Q{current + 1}/5</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                style={{ borderColor: timerColor, color: timerColor }}>
                <Timer className="w-3.5 h-3.5" />
                <span className="font-mono font-bold text-sm">{timeLeft}s</span>
              </div>
            </div>

            {/* Question */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10">
              <p className="text-white font-medium">{question.q}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {question.options.map((opt, idx) => {
                let cls = "border-white/10 bg-white/5 text-gray-300 hover:border-white/30";
                if (showAnswer) {
                  if (idx === question.answer) cls = "border-green-500/60 bg-green-500/10 text-green-300";
                  else if (idx === selected) cls = "border-red-500/60 bg-red-500/10 text-red-300";
                  else cls = "border-white/5 bg-white/5 text-gray-600 opacity-50";
                }
                return (
                  <button key={idx} onClick={() => handleSelect(idx)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${cls}`}>
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <button onClick={handleNext}
                className="w-full py-3 rounded-xl font-bold text-black"
                style={{ background: theme.gradient }}>
                {current + 1 < questions.length ? "Next ⚔️" : "See Result"}
              </button>
            )}
          </div>
        )}

        {/* Victory */}
        {phase === "victory" && (
          <div className="p-8 text-center space-y-5">
            <div className="text-6xl">🏆</div>
            <div>
              <h2 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Boss Defeated!</h2>
              <p className="text-gray-400">You answered {answers.filter(Boolean).length + 1}/5 correctly</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
              <div className="text-2xl font-bold text-yellow-400">+{bossLevel.xp} XP</div>
              {bossLevel.badge && <div className="text-sm text-gray-300 mt-1">🏅 {bossLevel.badge} badge unlocked!</div>}
            </div>
            <button onClick={() => { onVictory(); onClose(); }}
              className="w-full py-3 rounded-xl font-bold text-black"
              style={{ background: theme.gradient }}>
              Claim Reward 🎉
            </button>
          </div>
        )}

        {/* Defeat */}
        {phase === "defeat" && (
          <div className="p-8 text-center space-y-5">
            <div className="text-6xl">💀</div>
            <div>
              <h2 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Defeated!</h2>
              <p className="text-gray-400">You need 3/5 correct to win. Study more and try again!</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPhase("battle"); setCurrent(0); setSelected(null); setAnswers([]); setShowAnswer(false); setTimeLeft(TIME_PER_QUESTION); setBossHp(100); setPlayerHp(100); }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5">
                Retry ⚔️
              </button>
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5">
                Retreat
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}