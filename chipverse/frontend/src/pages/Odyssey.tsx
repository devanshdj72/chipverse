import { useEffect } from "react";
import { useLocation } from "wouter";

const ODYSSEY_KEY = "chipverse_odyssey_seen";

export default function Odyssey() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "odyssey_complete") {
        localStorage.setItem(ODYSSEY_KEY, "true");
        setLocation("/domains");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
      <iframe
        src="/vlsi-odyssey.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="VLSI Odyssey"
        allow="autoplay"
      />
    </div>
  );
}