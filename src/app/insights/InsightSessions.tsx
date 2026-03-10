"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface SessionData {
  id: string;
  title: string;
  mentor: string;
  topic: string;
  date: string;
  summary: string | null;
  rawNotes: string;
  keyInsights: string | null;
  tags: string | null;
  article: string | null;
}

const TAG_COLORS: Record<string, string> = {
  gtm: "text-yellow-400 bg-yellow-400/20 border-yellow-400/30",
  product: "text-teal-400 bg-teal-400/20 border-teal-400/30",
  pricing: "text-pink-400 bg-pink-400/20 border-pink-400/30",
  fundraising: "text-purple-400 bg-purple-400/20 border-purple-400/30",
  team: "text-blue-400 bg-blue-400/20 border-blue-400/30",
  strategy: "text-orange-400 bg-orange-400/20 border-orange-400/30",
};
const DEFAULT_TAG_COLOR = "text-white/60 bg-white/10 border-white/20";
const WOBBLES = ["wobbly-border", "wobbly-border-md"];

export default function InsightSessions({
  sessions,
}: {
  sessions: SessionData[];
}) {
  const router = useRouter();
  // Initialize articles from saved data
  const [articles, setArticles] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    sessions.forEach((s) => {
      if (s.article) initial[s.id] = s.article;
    });
    return initial;
  });
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleDeleteSession(id: string) {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function toggleArticle(sessionId: string) {
    setExpandedId(expandedId === sessionId ? null : sessionId);
  }

  async function generateArticle(session: SessionData) {
    setGenerating(session.id);
    setExpandedId(session.id);
    try {
      const plainNotes = session.rawNotes
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          title: session.title,
          rawNotes: plainNotes,
          summary: session.summary,
          keyInsights: session.keyInsights,
          mentor: session.mentor,
          topic: session.topic,
        }),
      });

      if (res.ok) {
        const { article } = await res.json();
        setArticles((prev) => ({ ...prev, [session.id]: article }));
      }
    } catch {
      // silent
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl text-white/70 flex items-center gap-2">
        <Icon icon="lucide:book-open" />
        Session Deep Dives
      </h2>
      <p className="text-sm text-white/40 -mt-2 mb-4">
        Click &ldquo;Generate Article&rdquo; to let AI organize and develop your
        notes into a structured knowledge article.
      </p>

      {sessions.map((session, i) => {
        const tags: string[] = session.tags ? JSON.parse(session.tags) : [];
        const insights: string[] = session.keyInsights
          ? JSON.parse(session.keyInsights)
          : [];
        const isGenerating = generating === session.id;
        const isExpanded = expandedId === session.id;
        const hasArticle = !!articles[session.id];

        return (
          <div key={session.id}>
            <div
              className={`p-5 bg-white/5 border-2 border-black ${WOBBLES[i % 2]} hard-shadow transition-all`}
            >
              <div className="flex items-start justify-between gap-4">
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

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag, j) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 border text-xs ${
                            TAG_COLORS[tag] || DEFAULT_TAG_COLOR
                          } ${WOBBLES[j % 2]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {session.summary && (
                    <p className="text-sm text-white/60 mt-3 italic line-clamp-2">
                      {session.summary}
                    </p>
                  )}

                  {/* Quick insights */}
                  {insights.length > 0 && !isExpanded && (
                    <ul className="mt-3 space-y-1">
                      {insights.slice(0, 3).map((ins, j) => (
                        <li
                          key={j}
                          className="flex gap-2 text-xs text-white/50"
                        >
                          <Icon
                            icon="lucide:sparkle"
                            className="text-purple-400 mt-0.5 shrink-0"
                            width={12}
                          />
                          <span className="line-clamp-1">{ins}</span>
                        </li>
                      ))}
                      {insights.length > 3 && (
                        <li className="text-xs text-white/30 ml-4">
                          +{insights.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                {hasArticle ? (
                  <>
                    {/* Show/Hide toggle */}
                    <button
                      onClick={() => toggleArticle(session.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-400 text-black border-2 border-black font-heading font-bold text-sm hard-shadow hard-shadow-hover wobbly-border transition-all"
                    >
                      <Icon
                        icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
                        width={16}
                      />
                      {isExpanded ? "Hide Article" : "Show Article"}
                    </button>
                    {/* Regenerate */}
                    <button
                      onClick={() => generateArticle(session)}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs wobbly-border-md hover:bg-purple-500/30 transition-all disabled:opacity-50"
                      title="Regenerate article with latest notes"
                    >
                      <Icon
                        icon={isGenerating ? "lucide:loader-2" : "lucide:refresh-cw"}
                        className={isGenerating ? "animate-spin" : ""}
                        width={14}
                      />
                      {isGenerating ? "" : "Regenerate"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => generateArticle(session)}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border-2 border-black border-purple-400/30 font-heading font-bold text-sm hard-shadow hard-shadow-hover wobbly-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon
                      icon={isGenerating ? "lucide:loader-2" : "lucide:book-open"}
                      className={isGenerating ? "animate-spin" : ""}
                      width={16}
                    />
                    {isGenerating ? "Generating..." : "Generate Article"}
                  </button>
                )}
                {/* Delete session */}
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="flex items-center text-red-400/40 hover:text-red-400 hover:bg-red-400/10 p-2 transition-all"
                  title="Delete session"
                >
                  <Icon icon="lucide:trash-2" width={16} />
                </button>
                </div>
              </div>
            </div>

            {/* Generated article */}
            {isExpanded && hasArticle && (
              <div className="mt-2 p-6 bg-purple-500/5 border-l-4 border-purple-400/50 border-r-2 border-b-2 border-t-0 border-r-black border-b-black">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <Icon
                    icon="lucide:sparkles"
                    className="text-purple-400"
                    width={18}
                  />
                  <span className="font-heading text-purple-400">
                    AI-Generated Knowledge Article
                  </span>
                </div>
                <div
                  className="tiptap article-content"
                  dangerouslySetInnerHTML={{ __html: articles[session.id] }}
                />
              </div>
            )}

            {/* Loading state */}
            {isExpanded && isGenerating && (
              <div className="mt-2 p-8 bg-purple-500/5 border-l-4 border-purple-400/50 text-center">
                <Icon
                  icon="lucide:loader-2"
                  className="text-purple-400 animate-spin mx-auto text-3xl mb-3"
                />
                <p className="text-white/50 text-sm">
                  AI is analyzing your notes and building a structured
                  article...
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
