import { prisma } from "@/lib/prisma";
import { Icon } from "@iconify/react";
import InsightSessions from "./InsightSessions";
import UnanalyzedSessions from "./UnanalyzedSessions";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const [sessions, unanalyzed] = await Promise.all([
    prisma.session.findMany({
      where: { summary: { not: null } },
      orderBy: { date: "desc" },
    }),
    prisma.session.findMany({
      where: { summary: null },
      orderBy: { date: "desc" },
      select: { id: true, title: true, mentor: true, topic: true, date: true },
    }),
  ]);

  // Aggregate tag counts
  const tagMap = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.tags) {
      const tags: string[] = JSON.parse(s.tags);
      tags.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
    }
  });
  const topTags = Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Mentor stats
  const mentorMap = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.mentor) mentorMap.set(s.mentor, (mentorMap.get(s.mentor) || 0) + 1);
  });
  const topMentors = Array.from(mentorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Insight count
  let totalInsights = 0;
  sessions.forEach((s) => {
    if (s.keyInsights) {
      totalInsights += JSON.parse(s.keyInsights).length;
    }
  });

  // Serialize for client component
  const serialized = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    mentor: s.mentor,
    topic: s.topic,
    date: s.date.toISOString(),
    summary: s.summary,
    rawNotes: s.rawNotes,
    keyInsights: s.keyInsights,
    tags: s.tags,
    article: s.article,
  }));

  const unanalyzedSerialized = unanalyzed.map((s) => ({
    ...s,
    date: s.date.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl flex items-center gap-3">
          <Icon icon="lucide:lightbulb" className="text-purple-400" />
          Knowledge Base
        </h1>
        <span className="text-white/50 text-sm">
          {totalInsights} insights from {sessions.length} sessions
        </span>
      </div>

      {sessions.length === 0 && unanalyzed.length === 0 ? (
        <div className="p-12 bg-white/5 border-2 border-dashed border-white/20 wobbly-border text-center">
          <Icon
            icon="lucide:lightbulb"
            className="text-white/20 text-5xl mx-auto mb-4"
          />
          <p className="text-white/50 text-lg mb-2">No insights yet.</p>
          <p className="text-white/30 text-sm">
            Create a session, add your notes, and use the Insight Builder to
            analyze them.
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="space-y-8">
          {unanalyzedSerialized.length > 0 && (
            <UnanalyzedSessions sessions={unanalyzedSerialized} />
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white/5 border-2 border-black wobbly-border hard-shadow text-center">
              <p className="text-2xl font-heading font-bold text-purple-400">
                {sessions.length}
              </p>
              <p className="text-xs text-white/40">Analyzed Sessions</p>
            </div>
            <div className="p-4 bg-white/5 border-2 border-black wobbly-border-md hard-shadow text-center">
              <p className="text-2xl font-heading font-bold text-yellow-400">
                {totalInsights}
              </p>
              <p className="text-xs text-white/40">Key Insights</p>
            </div>
            <div className="p-4 bg-white/5 border-2 border-black wobbly-border hard-shadow text-center">
              <p className="text-2xl font-heading font-bold text-teal-400">
                {topTags.length}
              </p>
              <p className="text-xs text-white/40">Topics Covered</p>
            </div>
            <div className="p-4 bg-white/5 border-2 border-black wobbly-border-md hard-shadow text-center">
              <p className="text-2xl font-heading font-bold text-pink-400">
                {topMentors.length}
              </p>
              <p className="text-xs text-white/40">Mentors</p>
            </div>
          </div>

          {/* Topic & mentor chips */}
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count], i) => (
              <span
                key={tag}
                className={`px-3 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 ${
                  i % 2 === 0 ? "wobbly-border" : "wobbly-border-md"
                } text-sm`}
              >
                {tag} ({count})
              </span>
            ))}
            {topMentors.map(([mentor, count], i) => (
              <span
                key={mentor}
                className={`px-3 py-1 bg-teal-400/20 text-teal-300 border border-teal-400/30 ${
                  i % 2 === 0 ? "wobbly-border-md" : "wobbly-border"
                } text-sm`}
              >
                {mentor} ({count})
              </span>
            ))}
          </div>

          {/* Unanalyzed sessions — build insights */}
          {unanalyzedSerialized.length > 0 && (
            <UnanalyzedSessions sessions={unanalyzedSerialized} />
          )}

          {/* Sessions with AI article generation */}
          <InsightSessions sessions={serialized} />
        </div>
      )}
    </div>
  );
}
