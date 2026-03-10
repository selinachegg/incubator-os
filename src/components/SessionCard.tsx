import Link from "next/link";

interface SessionCardProps {
  id: string;
  title: string;
  mentor: string;
  topic: string;
  date: string;
  tags: string | null;
}

export default function SessionCard({
  id,
  title,
  mentor,
  topic,
  date,
  tags,
}: SessionCardProps) {
  const parsedTags: string[] = tags ? JSON.parse(tags) : [];
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/sessions/${id}`}>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {mentor} &middot; {topic}
            </p>
          </div>
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {parsedTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
