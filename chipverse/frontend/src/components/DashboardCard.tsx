import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <div className={cn("bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}
