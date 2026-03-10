const BAR_COLORS = ["bg-teal-400", "bg-pink-400", "bg-yellow-400", "bg-purple-400", "bg-blue-400"];
const WOBBLES = ["wobbly-border", "wobbly-border-md"];

interface MentorStatsProps {
  mentors: { name: string; count: number }[];
}

export default function MentorStats({ mentors }: MentorStatsProps) {
  if (!mentors.length) return null;

  const maxCount = Math.max(...mentors.map((m) => m.count));

  return (
    <div className="p-6 border-4 border-black wobbly-border bg-[#16181d] hard-shadow">
      <h3 className="font-heading text-xl mb-4">Mentor Sessions</h3>
      <div className="space-y-4">
        {mentors.map((mentor, i) => (
          <div key={mentor.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{mentor.name}</span>
              <span>
                {mentor.count} session{mentor.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div
              className={`w-full h-3 bg-black/30 border border-black overflow-hidden ${WOBBLES[i % 2]}`}
            >
              <div
                className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${(mentor.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
