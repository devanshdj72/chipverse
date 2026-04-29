import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarWidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function SidebarWidget({ title, children, className }: SidebarWidgetProps) {
  return (
    <div className={cn("bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden", className)}>
      <div className="px-5 py-4 border-b border-white/10 bg-white/5">
        <h3 className="font-bold text-white text-sm font-['Orbitron'] tracking-wider uppercase">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
