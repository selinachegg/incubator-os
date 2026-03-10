interface InsightListProps {
  insights: string[];
}

export default function InsightList({ insights }: InsightListProps) {
  if (!insights.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">Key Insights</h2>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex gap-3 text-zinc-300">
            <span className="text-indigo-400 mt-0.5 shrink-0">&#9679;</span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
