import { Icon } from "@iconify/react";

interface InsightListProps {
  insights: string[];
}

export default function InsightList({ insights }: InsightListProps) {
  if (!insights.length) return null;

  return (
    <div>
      <h2 className="font-heading text-xl text-purple-400 mb-3 flex items-center gap-2">
        <Icon icon="lucide:lightbulb" />
        Key Insights
      </h2>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li
            key={i}
            className={`flex gap-3 text-white/90 p-3 bg-white/5 border-2 border-black ${i % 2 === 0 ? "wobbly-border" : "wobbly-border-md"} hard-shadow`}
          >
            <span className="text-purple-400 mt-0.5 shrink-0">
              <Icon icon="lucide:sparkle" />
            </span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
