import { Zap, Cpu, Gauge, Sigma, Layers, Microchip, ShieldCheck, Atom } from "lucide-react";

export type DomainTheme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  highlight: string;
  glow: string;
  card: string;
  border: string;
  dim: string;
  icon: any;
  gradient: string;
};

export const DOMAIN_THEMES: Record<string, DomainTheme> = {
  rtl: {
    id: "rtl",
    name: "RTL Design",
    primary: "#38BDF8",
    secondary: "#00E5FF",
    highlight: "#E0F2FE",
    glow: "rgba(56,189,248,0.35)",
    card: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.22)",
    dim: "rgba(56,189,248,0.12)",
    icon: Zap,
    gradient: "linear-gradient(135deg, #38BDF8, #00E5FF)",
  },
  verification: {
    id: "verification",
    name: "Verification",
    primary: "#8B5CF6",
    secondary: "#A855F7",
    highlight: "#C084FC",
    glow: "rgba(139,92,246,0.35)",
    card: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.22)",
    dim: "rgba(139,92,246,0.12)",
    icon: ShieldCheck,
    gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)",
  },
  "physical-design": {
    id: "physical-design",
    name: "Physical Design",
    primary: "#F59E0B",
    secondary: "#FB923C",
    highlight: "#FCD34D",
    glow: "rgba(245,158,11,0.35)",
    card: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    dim: "rgba(245,158,11,0.12)",
    icon: Layers,
    gradient: "linear-gradient(135deg, #F59E0B, #FB923C)",
  },
  analog: {
    id: "analog",
    name: "Analog IC",
    primary: "#10B981",
    secondary: "#14B8A6",
    highlight: "#34D399",
    glow: "rgba(16,185,129,0.35)",
    card: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.22)",
    dim: "rgba(16,185,129,0.12)",
    icon: Sigma,
    gradient: "linear-gradient(135deg, #10B981, #14B8A6)",
  },
  fpga: {
    id: "fpga",
    name: "FPGA Design",
    primary: "#3B82F6",
    secondary: "#22C55E",
    highlight: "#06B6D4",
    glow: "rgba(59,130,246,0.35)",
    card: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.22)",
    dim: "rgba(59,130,246,0.12)",
    icon: Cpu,
    gradient: "linear-gradient(135deg, #3B82F6, #22C55E)",
  },
  embedded: {
    id: "embedded",
    name: "Embedded Systems",
    primary: "#FACC15",
    secondary: "#F97316",
    highlight: "#38BDF8",
    glow: "rgba(250,204,21,0.35)",
    card: "rgba(250,204,21,0.08)",
    border: "rgba(250,204,21,0.22)",
    dim: "rgba(250,204,21,0.12)",
    icon: Microchip,
    gradient: "linear-gradient(135deg, #FACC15, #F97316)",
  },
  dft: {
    id: "dft",
    name: "DFT",
    primary: "#EC4899",
    secondary: "#EF4444",
    highlight: "#FCA5A5",
    glow: "rgba(236,72,153,0.35)",
    card: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.22)",
    dim: "rgba(236,72,153,0.12)",
    icon: Gauge,
    gradient: "linear-gradient(135deg, #EC4899, #EF4444)",
  },
  research: {
    id: "research",
    name: "Semiconductor Research",
    primary: "#F59E0B",
    secondary: "#60A5FA",
    highlight: "#FCD34D",
    glow: "rgba(245,158,11,0.30)",
    card: "rgba(96,165,250,0.08)",
    border: "rgba(245,158,11,0.22)",
    dim: "rgba(245,158,11,0.12)",
    icon: Atom,
    gradient: "linear-gradient(135deg, #F59E0B, #60A5FA)",
  },
};
