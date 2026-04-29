import { DOMAIN_THEMES } from "@/lib/themes";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { DOMAIN_LIST } from "@/lib/data";

interface DomainCardProps {
  domain: typeof DOMAIN_LIST[0];
}

export default function DomainCard({ domain }: DomainCardProps) {
  const theme = DOMAIN_THEMES[domain.id];
  const Icon = theme?.icon || (() => null);

  return (
    <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 transition-all duration-500 overflow-hidden">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: theme?.glow || "rgba(255,255,255,0.1)" }}
      />
      <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-start border border-white/5">
        <div 
          className="p-3 rounded-xl mb-4"
          style={{ background: theme?.card || "rgba(255,255,255,0.1)" }}
        >
          <Icon className="w-8 h-8" style={{ color: theme?.primary || "white" }} />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 font-['Orbitron']">{domain.name}</h3>
        <p className="text-gray-400 text-sm mb-6 flex-grow">{domain.tagline}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {domain.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={domain.route}
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-white transition-all duration-300 group-hover:gap-3"
          style={{ background: theme?.gradient || "linear-gradient(to right, #3b82f6, #8b5cf6)" }}
        >
          {domain.btnLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
