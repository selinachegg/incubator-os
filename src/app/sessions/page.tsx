import { prisma } from "@/lib/prisma";
import SessionCard from "@/components/SessionCard";
import SearchBar from "./SearchBar";

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
        <h1 className="text-2xl font-bold">Sessions</h1>
      </div>

      <SearchBar defaultValue={q} />

      {sessions.length === 0 ? (
        <p className="text-zinc-500 mt-8 text-center">
          {q ? "No sessions match your search." : "No sessions yet. Create your first one!"}
        </p>
      ) : (
        <div className="grid gap-3 mt-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              title={session.title}
              mentor={session.mentor}
              topic={session.topic}
              date={session.date.toISOString()}
              tags={session.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
