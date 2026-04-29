import React from "react";
import { Lock, Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Level } from "@/lib/data";
import { DomainTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface RoadmapNodeProps {
  level: Level;
  theme: DomainTheme;
  status: "locked" | "active" | "completed";
  index: number;
  onClick: () => void;
}

function RoadmapNodeComponent({ level, theme, status, index, onClick }: RoadmapNodeProps) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative flex items-center w-full my-8",
        isLeft ? "justify-start md:justify-end md:pr-12" : "justify-start md:pl-12"
      )}
    >
      {/* Node */}
      <div
        onClick={status !== "locked" ? onClick : undefined}
        className={cn(
          "absolute left-6 md:left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 hover:scale-110",
          status === "locked" ? "bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed" :
          status === "completed" ? "bg-black cursor-pointer" : "bg-black cursor-pointer"
        )}
        style={{
          borderColor: status !== "locked" ? theme.primary : undefined,
          boxShadow: status === "active" ? `0 0 20px ${theme.glow}` : undefined,
        }}
      >
        {status === "locked" && <Lock className="w-5 h-5" />}
        {status === "completed" && <Check className="w-5 h-5" style={{ color: theme.primary }} />}
        {status === "active" && <Play className="w-5 h-5 ml-1" style={{ color: theme.primary }} />}
      </div>

      {/* Card */}
      <div
        className={cn(
          "ml-20 md:ml-0 w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border backdrop-blur-md transition-all duration-300",
          status === "locked" ? "bg-white/5 border-white/10 opacity-70" : "bg-black/60 cursor-pointer hover:-translate-y-1 hover:border-white/30"
        )}
        style={{
          borderColor: status !== "locked" ? theme.border : undefined,
          boxShadow: status !== "locked" ? `0 4px 20px ${theme.card}` : undefined,
        }}
        onClick={status !== "locked" ? onClick : undefined}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-lg text-white font-['Orbitron']">{level.title}</h4>
          <span className="text-xs font-mono px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/10 shrink-0 ml-2">
            {level.xp} XP
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-4">{level.difficulty} • {level.hours}h</p>
        <div className="flex flex-wrap gap-2">
          {level.topics.slice(0, 3).map((topic, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">
              {topic}
            </span>
          ))}
          {level.topics.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-500">
              +{level.topics.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export const RoadmapNode = React.memo(RoadmapNodeComponent);
