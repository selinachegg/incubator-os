import Link from "next/link";

const TAG_COLORS = [
  "bg-yellow-400",
  "bg-teal-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-blue-400",
  "bg-orange-400",
  "bg-red-400",
  "bg-emerald-400",
];

const ROTATIONS = ["rotate-2", "-rotate-3", "rotate-1", "rotate-2", "-rotate-1", "rotate-3"];
const WOBBLES = ["wobbly-border", "wobbly-border-md"];

interface TopicCloudProps {
  tags: { name: string; count: number }[];
}

export default function TopicCloud({ tags }: TopicCloudProps) {
  if (!tags.length) return null;

  return (
    <div className="p-6 border-4 border-black wobbly-border-md bg-[#16181d] hard-shadow">
      <h3 className="font-heading text-xl mb-4">Topic Cloud</h3>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, i) => (
          <Link
            key={tag.name}
            href={`/sessions?q=${encodeURIComponent(tag.name)}`}
            className={`px-4 py-2 ${TAG_COLORS[i % TAG_COLORS.length]} text-black font-bold ${WOBBLES[i % 2]} ${ROTATIONS[i % ROTATIONS.length]} hard-shadow text-sm cursor-pointer hover:scale-110 transition-transform`}
          >
            {tag.name} ({tag.count})
          </Link>
        ))}
      </div>
    </div>
  );
}
