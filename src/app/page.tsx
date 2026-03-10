import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SessionCard from "@/components/SessionCard";
import AiInsightHero from "@/components/AiInsightHero";
import TopicCloud from "@/components/TopicCloud";
import MentorStats from "@/components/MentorStats";
import PendingActions from "@/components/PendingActions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: "desc" },
  });

  // Compute mentor frequency
  const mentorMap = new Map<string, number>();
  sessions.forEach((s) => {
    mentorMap.set(s.mentor, (mentorMap.get(s.mentor) || 0) + 1);
  });
  const mentors = Array.from(mentorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Compute tag frequency
  const tagMap = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.tags) {
      const parsed: string[] = JSON.parse(s.tags);
      parsed.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
    }
  });
  const tags = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topTag = tags.length > 0 ? tags[0].name : null;
  const mentorNames = mentors.map((m) => m.name);

  // Fetch pending action items from DB
  const pendingActions = await prisma.actionItem.findMany({
    where: { completed: false },
    include: { session: { select: { title: true } } },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });
  const allActions = pendingActions.map((a) => ({
    text: a.text,
    sessionTitle: a.session.title,
    priority: a.priority,
  }));

  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="space-y-8">
      <AiInsightHero
        mentorNames={mentorNames}
        topTag={topTag}
        sessionCount={sessions.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-heading text-2xl">Recent Sessions</h3>
            <Link href="/sessions" className="text-teal-400 hover:underline">
              View all sessions &rarr;
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-white/50 text-center py-8">
              No sessions yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  title={session.title}
                  mentor={session.mentor}
                  topic={session.topic}
                  date={session.date.toISOString()}
                  tags={session.tags}
                  summary={session.summary}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side Widgets */}
        <div className="space-y-8">
          <TopicCloud tags={tags} />
          <MentorStats mentors={mentors} />
        </div>
      </div>

      <PendingActions actions={allActions} />
    </div>
  );
}
