import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold text-white font-['Orbitron']">
            404 — Page Not Found
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          The circuit you're looking for doesn't exist on this board.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 text-sm font-semibold hover:bg-cyan-500/20 transition-colors"
        >
          Return to ChipVerse
        </Link>
      </div>
    </div>
  );
}
