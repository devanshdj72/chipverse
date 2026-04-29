import { useEffect } from "react";
import { useLocation } from "wouter";
import { setAccessToken } from "@/lib/api";

/**
 * This page is loaded after Google/LinkedIn OAuth redirect.
 * Backend redirects to: /auth/callback?token=xxx&provider=google
 * We grab the token, store it in memory, then redirect to dashboard.
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      setLocation("/login?error=" + (error ?? "unknown"));
      return;
    }

    setAccessToken(token);
    // Small delay to allow state to settle
    setTimeout(() => setLocation("/dashboard"), 100);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p className="text-gray-400 font-mono text-sm">Completing sign in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
