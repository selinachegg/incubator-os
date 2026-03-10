"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface AnalyzeButtonProps {
  sessionId: string;
  alreadyAnalyzed: boolean;
}

export default function AnalyzeButton({
  sessionId,
  alreadyAnalyzed,
}: AnalyzeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 border-2 border-black wobbly-border font-heading font-bold text-lg hard-shadow hard-shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon icon="lucide:sparkles" className={loading ? "animate-spin" : ""} />
        {loading
          ? "Analyzing..."
          : alreadyAnalyzed
            ? "Re-analyze with AI"
            : "Analyze with AI"}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 font-body">{error}</p>
      )}
    </div>
  );
}
