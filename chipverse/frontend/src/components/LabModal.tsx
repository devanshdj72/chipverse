import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { Level } from "@/lib/data";
import { DomainTheme } from "@/lib/themes";

// ─── Quiz Questions per labType ───────────────────────────────────────────────

const QUIZ_QUESTIONS: Record<string, { q: string; options: string[]; answer: number }[]> = {
  quiz: [
    { q: "What does VLSI stand for?", options: ["Very Large Scale Integration", "Virtual Logic System Interface", "Voltage Level Signal Input", "Variable Length Signal Integration"], answer: 0 },
    { q: "What is the difference between ASIC and FPGA?", options: ["ASICs are reprogrammable, FPGAs are not", "FPGAs are reprogrammable, ASICs are not", "Both are reprogrammable", "Neither is reprogrammable"], answer: 1 },
    { q: "Which describes the Frontend design flow?", options: ["Place and Route", "RTL to Gate Netlist", "GDSII Generation", "Physical Verification"], answer: 1 },
  ],
  simulation: [
    { q: "Which gate outputs 1 only when all inputs are 1?", options: ["OR", "NOT", "AND", "XOR"], answer: 2 },
    { q: "What is the output of XOR(1,1)?", options: ["0", "1", "Z", "X"], answer: 0 },
    { q: "A D flip-flop captures input on which edge?", options: ["Any time", "Clock edge", "Reset", "Power on"], answer: 1 },
  ],
  coding: [
    { q: "In Verilog, which keyword defines a module's input/output ports?", options: ["begin/end", "input/output", "wire/reg", "always/initial"], answer: 1 },
    { q: "What does 'always @(posedge clk)' mean?", options: ["Runs always", "Runs on positive clock edge", "Runs on negative clock edge", "Runs once"], answer: 1 },
    { q: "Which is used for combinational logic in Verilog?", options: ["always @(posedge clk)", "always @(*)", "initial block", "generate block"], answer: 1 },
  ],
  project: [
    { q: "What is a Finite State Machine (FSM)?", options: ["A memory element", "A sequential circuit with defined states", "A combinational circuit", "A clock divider"], answer: 1 },
    { q: "What does RTL stand for?", options: ["Register Transfer Level", "Real Time Logic", "Resistor Transistor Logic", "Runtime Transfer Layer"], answer: 0 },
    { q: "Which protocol uses start/stop bits for serial communication?", options: ["SPI", "I2C", "UART", "AXI"], answer: 2 },
  ],
  challenge: [
    { q: "What is a setup time violation?", options: ["Data changes after clock edge", "Data doesn't settle before clock edge", "Clock is too fast", "Power is too low"], answer: 1 },
    { q: "What does CDC stand for in chip design?", options: ["Clock Domain Crossing", "Circuit Design Check", "Core Design Closure", "Clock Delay Compensation"], answer: 0 },
    { q: "What causes a latch in RTL design?", options: ["Missing reset", "Incomplete if/case", "Too many outputs", "Clock skew"], answer: 1 },
  ],
  tool: [
    { q: "What does synthesis do in chip design?", options: ["Converts RTL to gate netlist", "Places cells on chip", "Routes wires", "Verifies timing"], answer: 0 },
    { q: "What is SDC used for?", options: ["Simulation", "Timing constraints", "Power analysis", "DRC checks"], answer: 1 },
    { q: "Which tool is used for static timing analysis?", options: ["Cadence Virtuoso", "Synopsys PrimeTime", "ModelSim", "Vivado"], answer: 1 },
  ],
  capstone: [
    { q: "What is a RISC-V ALU responsible for?", options: ["Memory access", "Arithmetic and logic operations", "Branch prediction", "Cache control"], answer: 1 },
    { q: "What is an AXI interface used for?", options: ["Power delivery", "High performance on-chip communication", "Clock distribution", "Physical routing"], answer: 1 },
    { q: "What does DMA stand for?", options: ["Direct Memory Access", "Dynamic Module Allocation", "Data Management Array", "Digital Memory Address"], answer: 0 },
  ],
  career: [
    { q: "Which skill is most valued for RTL roles?", options: ["Python scripting", "Verilog/SystemVerilog", "PCB design", "Web development"], answer: 1 },
    { q: "What do companies look for in a DV engineer?", options: ["UVM knowledge", "Layout skills", "PCB routing", "Analog design"], answer: 0 },
    { q: "What is a typical first round in VLSI interviews?", options: ["HR screening", "Digital logic and HDL coding", "System design", "Management round"], answer: 1 },
  ],
  boss: [
    { q: "What is the purpose of a processor datapath?", options: ["Store programs", "Execute instructions step by step", "Route signals", "Manage power"], answer: 1 },
    { q: "What is timing sign-off?", options: ["Approving the design", "Verifying all timing constraints are met", "Final layout check", "Power analysis"], answer: 1 },
    { q: "What does tapeout mean?", options: ["Testing on FPGA", "Sending final GDSII to fabrication", "Writing testbench", "Running simulation"], answer: 1 },
  ],
  analysis: [
    { q: "What is the purpose of reading a research abstract?", options: ["To find bugs", "To understand the paper's contribution quickly", "To copy results", "To check grammar"], answer: 1 },
    { q: "What does novelty mean in research?", options: ["A new algorithm only", "Something not done before that adds value", "A faster simulation", "A better tool"], answer: 1 },
    { q: "Which organization sets semiconductor roadmaps?", options: ["IEEE", "ITRS/IRDS", "ACM", "ISO"], answer: 1 },
  ],
  study: [
    { q: "What causes short channel effects in CMOS?", options: ["High voltage", "Device scaling below certain dimensions", "Too much current", "Clock frequency"], answer: 1 },
    { q: "What is leakage current?", options: ["Current when device is ON", "Current when device is OFF", "Power supply current", "Clock current"], answer: 1 },
    { q: "What is Moore's Law about?", options: ["Transistor speed", "Transistor count doubling every ~2 years", "Power consumption", "Die size"], answer: 1 },
  ],
  design: [
    { q: "What is a FinFET?", options: ["A flat transistor", "A 3D transistor with fin-shaped channel", "A memory cell", "A logic gate"], answer: 1 },
    { q: "What is compute-in-memory?", options: ["Using CPU cache", "Performing computation inside memory", "Cloud computing", "Virtual memory"], answer: 1 },
    { q: "What is a chiplet?", options: ["A small chip that integrates with others", "A type of memory", "A clock circuit", "A power regulator"], answer: 0 },
  ],
  writing: [
    { q: "What makes a good research paper title?", options: ["Long and detailed", "Short, specific, and describes contribution", "Contains all author names", "Mentions the tool used"], answer: 1 },
    { q: "What section describes your methodology?", options: ["Abstract", "Introduction", "Methods/Implementation", "Conclusion"], answer: 2 },
    { q: "What is a patent claim?", options: ["A marketing statement", "A legal definition of what is protected", "An experiment result", "A bibliography entry"], answer: 1 },
  ],
};

const DEFAULT_QUESTIONS = QUIZ_QUESTIONS["quiz"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface LabModalProps {
  level: Level;
  theme: DomainTheme;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LabModal({ level, theme, isCompleted, onClose, onComplete }: LabModalProps) {
  const questions = QUIZ_QUESTIONS[level.labType] || DEFAULT_QUESTIONS;
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const question = questions[current];
  const score = answers.filter(Boolean).length;
  const passed = score >= 2;

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    setAnswers((prev) => [...prev, idx === question.answer]);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setPhase("result");
    }
  };

  const handleRetry = () => {
    setPhase("quiz");
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowAnswer(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-gray-900 border rounded-2xl overflow-hidden shadow-2xl"
        style={{ borderColor: theme.border }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between" style={{ background: theme.card }}>
          <div>
            <div className="text-xs font-mono tracking-wider mb-1" style={{ color: theme.primary }}>
              LEVEL {level.level} · {level.labType.toUpperCase()} LAB
            </div>
            <h2 className="text-lg font-bold text-white">{level.lab}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro Phase */}
        {phase === "intro" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-white font-bold mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {level.topics.map((t) => (
                  <span key={t} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">{t}</span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Lab Mission</div>
              <div className="text-white font-medium">{level.lab}</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{level.labType} · {level.hours} hours · {level.xp} XP</div>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
              <div className="text-sm font-medium mb-1" style={{ color: theme.primary }}>📋 Quiz Challenge</div>
              <div className="text-gray-300 text-sm">Answer {questions.length} questions to complete this lab and earn <span className="font-bold text-white">+{level.xp} XP</span></div>
            </div>
            {isCompleted ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Already completed! You earned {level.xp} XP</span>
              </div>
            ) : (
              <button
                onClick={() => setPhase("quiz")}
                className="w-full py-3 rounded-xl font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: theme.gradient }}
              >
                Start Lab Quiz <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && (
          <div className="p-6 space-y-5">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Question {current + 1} of {questions.length}</span>
              <span className="font-mono text-xs px-2 py-1 rounded bg-white/10" style={{ color: theme.primary }}>
                {answers.filter(Boolean).length} correct
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${((current) / questions.length) * 100}%`, background: theme.gradient }}
              />
            </div>

            {/* Question */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <p className="text-white font-medium text-base">{question.q}</p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {question.options.map((opt, idx) => {
                let style = "border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10";
                if (showAnswer) {
                  if (idx === question.answer) style = "border-green-500/60 bg-green-500/10 text-green-300";
                  else if (idx === selected) style = "border-red-500/60 bg-red-500/10 text-red-300";
                  else style = "border-white/5 bg-white/5 text-gray-500 opacity-60";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style} flex items-center gap-3`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                    {showAnswer && idx === question.answer && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto shrink-0" />}
                    {showAnswer && idx === selected && idx !== question.answer && <XCircle className="w-4 h-4 text-red-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: theme.gradient }}
              >
                {current + 1 < questions.length ? "Next Question" : "See Results"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Result Phase */}
        {phase === "result" && (
          <div className="p-6 space-y-5 text-center">
            <div className="flex justify-center">
              {passed ? (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: theme.card, border: `2px solid ${theme.primary}`, boxShadow: `0 0 30px ${theme.glow}` }}>
                  <Trophy className="w-10 h-10" style={{ color: theme.primary }} />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/10 border-2 border-red-500/40">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{passed ? "Lab Complete! 🎉" : "Not quite..."}</h3>
              <p className="text-gray-400">{score} out of {questions.length} correct</p>
            </div>

            <div className="flex justify-center gap-2">
              {questions.map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${answers[i] ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"}`}>
                  {answers[i] ? "✓" : "✗"}
                </div>
              ))}
            </div>

            {passed ? (
              <div className="p-4 rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                <div className="text-lg font-bold mb-1" style={{ color: theme.primary }}>+{level.xp} XP Earned!</div>
                {level.badge && <div className="text-sm text-gray-300">🏅 Badge unlocked: <span className="text-white font-medium">{level.badge}</span></div>}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                You need at least 2 correct answers to pass. Review the topics and try again!
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-300 border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              {passed && !isCompleted && (
                <button
                  onClick={() => { onComplete(); onClose(); }}
                  className="flex-1 py-3 rounded-xl font-bold text-black transition-all hover:opacity-90"
                  style={{ background: theme.gradient }}
                >
                  Claim {level.xp} XP 🏆
                </button>
              )}
              {(isCompleted || !passed) && (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-semibold border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}