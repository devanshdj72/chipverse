import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FloatingParticles({ count = 20 }: { count?: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 5,
      }))
    );
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
