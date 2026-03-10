import { prisma } from "@/lib/prisma";
import SessionCard from "@/components/SessionCard";
import SearchInput from "./SearchInput";
import { Icon } from "@iconify/react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const sessions = q
    ? await prisma.session.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { mentor: { contains: q } },
            { topic: { contains: q } },
            { tags: { contains: q } },
            { summary: { contains: q } },
            { rawNotes: { contains: q } },
            { keyInsights: { contains: q } },
            { actionItems: { contains: q } },
          ],
        },
        orderBy: { date: "desc" },
      })
    : [];

  // Get all unique tags for suggestion chips
  const allSessions = await prisma.session.findMany({
    select: { tags: true, mentor: true, topic: true },
  });
  const tagSet = new Set<string>();
  const mentorSet = new Set<string>();
  const topicSet = new Set<string>();
  allSessions.forEach((s) => {
    if (s.tags) {
      const tags: string[] = JSON.parse(s.tags);
      tags.forEach((t) => tagSet.add(t));
    }
    if (s.mentor) mentorSet.add(s.mentor);
    if (s.topic) topicSet.add(s.topic);
  });

  return (
    <div>
      <h1 className="font-heading text-3xl flex items-center gap-3 mb-6">
        <Icon icon="lucide:search" className="text-yellow-400" />
        Search
      </h1>

      <SearchInput defaultValue={q} />

      {/* Quick filter chips */}
      {!q && (tagSet.size > 0 || mentorSet.size > 0) && (
        <div className="mt-6 space-y-4">
          {tagSet.size > 0 && (
            <div>
              <h3 className="font-heading text-lg text-white/60 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(tagSet).map((tag) => (
                  <a
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 wobbly-border text-sm hover:bg-yellow-400/30 transition-all"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          )}

          {mentorSet.size > 0 && (
            <div>
              <h3 className="font-heading text-lg text-white/60 mb-2">
                Mentors
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(mentorSet)
                  .filter(Boolean)
                  .map((mentor) => (
                    <a
                      key={mentor}
                      href={`/search?q=${encodeURIComponent(mentor)}`}
                      className="px-3 py-1 bg-teal-400/20 text-teal-400 border border-teal-400/30 wobbly-border-md text-sm hover:bg-teal-400/30 transition-all"
                    >
                      {mentor}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {topicSet.size > 0 && (
            <div>
              <h3 className="font-heading text-lg text-white/60 mb-2">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(topicSet).map((topic) => (
                  <a
                    key={topic}
                    href={`/search?q=${encodeURIComponent(topic)}`}
                    className="px-3 py-1 bg-purple-400/20 text-purple-400 border border-purple-400/30 wobbly-border text-sm hover:bg-purple-400/30 transition-all"
                  >
                    {topic}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {q && (
        <div className="mt-6">
          <p className="text-white/50 text-sm mb-4">
            {sessions.length} result{sessions.length !== 1 ? "s" : ""} for
            &ldquo;{q}&rdquo;
          </p>
          {sessions.length === 0 ? (
            <div className="p-12 bg-white/5 border-2 border-dashed border-white/20 wobbly-border text-center">
              <p className="text-white/50 text-lg">
                No results found. Try a different search term.
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
      )}
    </div>
  );
}
