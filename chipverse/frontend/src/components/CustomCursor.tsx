import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUserContext } from "@/lib/user";
import { DOMAIN_THEMES } from "@/lib/themes";

// Map URL paths → domain IDs
const PATH_TO_DOMAIN: Record<string, string> = {
  "/path/rtl":              "rtl",
  "/path/verification":     "verification",
  "/path/physical-design":  "physical-design",
  "/path/analog":           "analog",
  "/path/fpga":             "fpga",
  "/path/embedded":         "embedded",
  "/path/dft":              "dft",
  "/path/research":         "research",
};

const DEFAULT_COLOR = "#00f5ff";

function getCursorColor(path: string): string {
  const entry = Object.entries(PATH_TO_DOMAIN).find(([p]) => path.startsWith(p));
  if (!entry) return DEFAULT_COLOR;
  return DOMAIN_THEMES[entry[1]]?.primary ?? DEFAULT_COLOR;
}

export default function CustomCursor() {
  const { isAuthenticated } = useUserContext();
  const [location] = useLocation();
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);
  const pos     = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const rafRef  = useRef<number>(0);

  const color = getCursorColor(location);

  // Update cursor color smoothly on route change
  useEffect(() => {
    if (ringRef.current) ringRef.current.style.borderColor = color;
    if (dotRef.current)  dotRef.current.style.background   = color;
  }, [color]);

  useEffect(() => {
    if (!isAuthenticated) return;

    document.documentElement.style.cursor = "none";

    // Force hide native cursor on ALL elements (overrides cursor:pointer on buttons/links)
    const style = document.createElement("style");
    style.id = "chipverse-cursor-hide";
    style.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(style);

    const onMove = (e: MouseEvent) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top  = e.clientY + "px";
      }
    };

    const onDown = () => { if (ringRef.current) ringRef.current.style.transform = "scale(0.7)"; };
    const onUp   = () => { if (ringRef.current) ringRef.current.style.transform = "scale(1)"; };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);

    const animate = () => {
      const p = pos.current;
      p.cx += (p.mx - p.cx) * 0.15;
      p.cy += (p.my - p.cy) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.left = (p.cx - 8) + "px";
        ringRef.current.style.top  = (p.cy - 8) + "px";
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.style.cursor = "";
      document.getElementById("chipverse-cursor-hide")?.remove();
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Outer lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          width: "16px",
          height: "16px",
          border: `1.5px solid ${color}`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          transition: "transform 0.1s ease, border-color 0.4s ease",
          mixBlendMode: "difference",
          top: 0,
          left: 0,
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          width: "4px",
          height: "4px",
          background: color,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-50%, -50%)",
          transition: "background 0.4s ease",
          top: 0,
          left: 0,
        }}
      />
    </>
  );
}