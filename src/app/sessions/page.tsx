import { prisma } from "@/lib/prisma";
import SessionCard from "@/components/SessionCard";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SessionsPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const sessions = await prisma.session.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { mentor: { contains: q } },
            { topic: { contains: q } },
            { tags: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl">
          {q ? `Search: "${q}"` : "All Sessions"}
        </h1>
        <span className="text-white/50 text-sm">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 bg-white/5 border-2 border-dashed border-white/20 wobbly-border text-center">
          <p className="text-white/50 text-lg">
            {q
              ? "No sessions match your search."
              : "No sessions yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
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
  );
}
