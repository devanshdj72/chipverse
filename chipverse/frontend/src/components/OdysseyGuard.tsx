import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUserContext } from "@/lib/user";

const ODYSSEY_KEY = "chipverse_odyssey_seen";

export default function OdysseyGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useUserContext();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (location === "/odyssey") return;                          // already there
    if (location === "/" || location === "/login") return;        // public pages
    if (isAuthenticated && !localStorage.getItem(ODYSSEY_KEY)) {
      setLocation("/odyssey");
    }
  }, [isAuthenticated, isLoading, location]);

  return <>{children}</>;
}