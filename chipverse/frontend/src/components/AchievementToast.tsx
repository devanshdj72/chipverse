import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/lib/achievements";

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.8 }}
          className="fixed top-20 left-1/2 z-[100] -translate-x-1/2"
          onAnimationComplete={() => setTimeout(onClose, 3000)}
        >
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-yellow-500/40 bg-black/90 backdrop-blur-xl shadow-2xl"
            style={{ boxShadow: "0 0 40px rgba(234,179,8,0.3)" }}>
            <div className="text-4xl">{achievement.icon}</div>
            <div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-0.5">
                🏆 Achievement Unlocked!
              </div>
              <div className="text-white font-bold text-lg">{achievement.title}</div>
              <div className="text-gray-400 text-sm">{achievement.description}</div>
            </div>
            <div className="text-right ml-2">
              <div className="text-yellow-400 font-bold text-lg">+{achievement.xpReward}</div>
              <div className="text-gray-500 text-xs">XP</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}