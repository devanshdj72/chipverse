import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useUserContext } from "@/lib/user";

const ODYSSEY_KEY = "chipverse_odyssey_seen";

export default function OdysseyGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useUserContext();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (location === "/odyssey") return;
    if (location === "/login") return;
    if (location.startsWith("/admin")) return;
    if (location.startsWith("/auth")) return;
    if (isAuthenticated && !localStorage.getItem(ODYSSEY_KEY)) {
      setLocation("/odyssey");
    }
  }, [isAuthenticated, isLoading, location]);

  return <>{children}</>;
}