import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroBannerProps {
  onStart: () => void;
  onExplore: () => void;
}

export default function HeroBanner({ onStart, onExplore }: HeroBannerProps) {
  return (
    <div className="relative pt-32 pb-20 px-4 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>The Next Generation of Hardware Engineers</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-['Orbitron'] leading-tight">
          Master the Art of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600">
            Silicon Design
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Level up your VLSI skills through interactive roadmaps, industry-grade labs, 
          and gamified learning. From logic gates to tapeout, your journey starts here.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Start Journey <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2"
          >
            Explore Domains
          </button>
        </div>
      </motion.div>
    </div>
  );
}
