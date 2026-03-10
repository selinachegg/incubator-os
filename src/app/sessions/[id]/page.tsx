import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InsightList from "@/components/InsightList";
import ActionList from "@/components/ActionList";
import EditableNotes from "@/components/EditableNotes";
import { Icon } from "@iconify/react";
import DeleteSessionButton from "@/components/DeleteSessionButton";
import EditableSessionHeader from "@/components/EditableSessionHeader";

interface Props {
  params: Promise<{ id: string }>;
}

const TAG_COLORS = [
  { bg: "bg-yellow-400/20", text: "text-yellow-400", border: "border-yellow-400/30" },
  { bg: "bg-purple-400/20", text: "text-purple-400", border: "border-purple-400/30" },
  { bg: "bg-teal-400/20", text: "text-teal-400", border: "border-teal-400/30" },
  { bg: "bg-pink-400/20", text: "text-pink-400", border: "border-pink-400/30" },
];

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

  const sessionContext = [
    `Title: ${session.title}`,
    session.mentor ? `Mentor: ${session.mentor}` : "",
    `Topic: ${session.topic}`,
    session.summary ? `Summary: ${session.summary}` : "",
    `Notes: ${session.rawNotes.slice(0, 500)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/sessions"
          className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          <Icon icon="lucide:arrow-left" />
          Back to sessions
        </Link>
        <div className="flex items-start justify-between gap-4">
          <EditableSessionHeader
            sessionId={session.id}
            initialTitle={session.title}
            initialMentor={session.mentor}
            initialTopic={session.topic}
            initialDate={session.date.toISOString()}
          />
          <DeleteSessionButton sessionId={session.id} />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, i) => {
              const color = TAG_COLORS[i % TAG_COLORS.length];
              const wobble = i % 2 === 0 ? "wobbly-border" : "wobbly-border-md";
              return (
                <span
                  key={tag}
                  className={`px-3 py-1 ${color.bg} ${color.text} border ${color.border} ${wobble} text-xs`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {!hasAnalysis && (
          <p className="text-white/40 text-sm mt-4 italic">
            Click &ldquo;Edit&rdquo; on your notes below, then use the
            &ldquo;Insight Builder&rdquo; button in the toolbar to analyze.
          </p>
        )}
      </div>

      {/* AI Analysis Results */}
      {hasAnalysis && (
        <div className="space-y-8">
          <div className="p-6 bg-purple-500/10 border-[3px] border-purple-400 wobbly-border hard-shadow">
            <h2 className="font-heading text-xl text-purple-400 mb-3 flex items-center gap-2">
              <Icon icon="lucide:sparkles" />
              Summary
            </h2>
            <p className="text-white/90 leading-relaxed text-lg">
              {session.summary}
            </p>
          </div>

          <InsightList insights={keyInsights} />
          <ActionList actions={actionItems} sessionContext={sessionContext} />
        </div>
      )}

      {/* Editable Raw Notes */}
      <EditableNotes sessionId={session.id} initialNotes={session.rawNotes} />
    </div>
  );
}
