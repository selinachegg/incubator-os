import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InsightList from "@/components/InsightList";
import ActionList from "@/components/ActionList";
import AnalyzeButton from "@/components/AnalyzeButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await prisma.session.findUnique({ where: { id } });

  if (!session) notFound();

  const keyInsights: string[] = session.keyInsights
    ? JSON.parse(session.keyInsights)
    : [];
  const actionItems: string[] = session.actionItems
    ? JSON.parse(session.actionItems)
    : [];
  const tags: string[] = session.tags ? JSON.parse(session.tags) : [];
  const hasAnalysis = !!session.summary;

  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{session.title}</h1>
        <p className="text-zinc-400 mt-1">
          {session.mentor} &middot; {session.topic} &middot; {formattedDate}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-900/50 border border-indigo-700/50 px-3 py-0.5 text-xs text-indigo-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <AnalyzeButton sessionId={session.id} alreadyAnalyzed={hasAnalysis} />
      </div>

      {hasAnalysis && (
        <div className="space-y-8 mb-10">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Summary</h2>
            <p className="text-zinc-300 leading-relaxed">{session.summary}</p>
          </div>

          <InsightList insights={keyInsights} />
          <ActionList actions={actionItems} />
        </div>
      )}

      <div className="border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-semibold text-white mb-3">Raw Notes</h2>
        <pre className="whitespace-pre-wrap text-sm text-zinc-400 bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          {session.rawNotes}
        </pre>
      </div>
    </div>
  );
}
