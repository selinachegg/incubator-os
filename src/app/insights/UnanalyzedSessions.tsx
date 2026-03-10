"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface UnanalyzedSession {
  id: string;
  title: string;
  mentor: string;
  topic: string;
  date: string;
}

const WOBBLES = ["wobbly-border", "wobbly-border-md"];

export default function UnanalyzedSessions({
  sessions,
}: {
  sessions: UnanalyzedSession[];
}) {
  const router = useRouter();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  async function handleDelete(sessionId: string) {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleAnalyze(sessionId: string) {
    setAnalyzingId(sessionId);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Analysis failed");
      }
    } catch {
      alert("Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl text-yellow-400 flex items-center gap-2">
        <Icon icon="lucide:zap" />
        Ready to Analyze
      </h2>
      <p className="text-sm text-white/40 -mt-2 mb-4">
        These sessions have notes but haven&apos;t been analyzed yet. Click
        &ldquo;Build Insights&rdquo; to extract key takeaways.
      </p>

      {sessions.map((session, i) => {
        const isAnalyzing = analyzingId === session.id;
        return (
          <div
            key={session.id}
            className={`p-4 bg-yellow-400/5 border-2 border-black ${WOBBLES[i % 2]} hard-shadow transition-all`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/sessions/${session.id}`}>
                  <h3 className="text-lg font-bold text-white hover:text-yellow-400 transition-colors">
                    {session.title}
                  </h3>
                </Link>
                <p className="text-sm text-white/50 mt-1">
                  {session.mentor && (
                    <span className="text-teal-400">{session.mentor}</span>
                  )}
                  {session.mentor && " · "}
                  {session.topic} ·{" "}
                  {new Date(session.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAnalyze(session.id)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black border-2 border-black font-heading font-bold text-sm hard-shadow hard-shadow-hover wobbly-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon
                    icon={isAnalyzing ? "lucide:loader-2" : "lucide:sparkles"}
                    className={isAnalyzing ? "animate-spin" : ""}
                    width={16}
                  />
                  {isAnalyzing ? "Analyzing..." : "Build Insights"}
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="flex items-center text-red-400/40 hover:text-red-400 hover:bg-red-400/10 p-2 transition-all"
                  title="Delete session"
                >
                  <Icon icon="lucide:trash-2" width={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
