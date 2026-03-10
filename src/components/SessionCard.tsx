"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface SessionCardProps {
  id: string;
  title: string;
  mentor: string;
  topic: string;
  date: string;
  tags: string | null;
  summary?: string | null;
}

const TAG_COLORS = [
  { bg: "bg-yellow-400/20", text: "text-yellow-400", border: "border-yellow-400/30" },
  { bg: "bg-purple-400/20", text: "text-purple-400", border: "border-purple-400/30" },
  { bg: "bg-teal-400/20", text: "text-teal-400", border: "border-teal-400/30" },
  { bg: "bg-pink-400/20", text: "text-pink-400", border: "border-pink-400/30" },
  { bg: "bg-blue-400/20", text: "text-blue-400", border: "border-blue-400/30" },
  { bg: "bg-orange-400/20", text: "text-orange-400", border: "border-orange-400/30" },
];

const MENTOR_COLORS = [
  "text-teal-400",
  "text-pink-400",
  "text-yellow-400",
  "text-purple-400",
  "text-blue-400",
];

export default function SessionCard({
  id,
  title,
  mentor,
  topic,
  date,
  tags,
  summary,
}: SessionCardProps) {
  const router = useRouter();
  const parsedTags: string[] = tags ? JSON.parse(tags) : [];
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const mentorColorIndex =
    mentor.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    MENTOR_COLORS.length;

  const wobbleIndex =
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2;
  const wobble = wobbleIndex === 0 ? "wobbly-border-md" : "wobbly-border";
  const hoverRotate = wobbleIndex === 0 ? "hover:-rotate-1" : "hover:rotate-1";

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Link href={`/sessions/${id}`}>
      <div
        className={`group bg-white/5 p-6 border-2 border-black ${wobble} hard-shadow hard-shadow-hover ${hoverRotate} transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden cursor-pointer`}
      >
        <div className="absolute top-2 right-4 text-white/10">
          <Icon icon="lucide:quote" className="text-6xl" />
        </div>
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 z-10"
          title="Delete session"
        >
          <Icon icon="lucide:trash-2" width={16} />
        </button>
        <div className="shrink-0">
          <div
            className={`w-16 h-16 bg-teal-500/20 border-2 border-black ${wobble} rotate-3 hard-shadow flex items-center justify-center`}
          >
            <Icon icon="lucide:mic" className="text-teal-400 text-2xl" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h4 className="text-xl font-bold mb-1 truncate">{title}</h4>
              <p className="text-white/60 mb-2">
                Mentor:{" "}
                <span className={MENTOR_COLORS[mentorColorIndex]}>
                  {mentor}
                </span>{" "}
                &bull; {formattedDate}
              </p>
            </div>
            {parsedTags.length > 0 && (
              <div className="flex gap-2 shrink-0">
                {parsedTags.slice(0, 3).map((tag, i) => {
                  const color = TAG_COLORS[i % TAG_COLORS.length];
                  const tw = i % 2 === 0 ? "wobbly-border" : "wobbly-border-md";
                  return (
                    <span
                      key={tag}
                      className={`px-3 py-1 ${color.bg} ${color.text} border ${color.border} ${tw} text-xs`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {summary && (
            <p className="text-white/80 line-clamp-2 italic">{summary}</p>
          )}
          {!summary && (
            <p className="text-white/40 text-sm italic">
              Not analyzed yet — click to analyze with AI
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
