interface ActionListProps {
  actions: string[];
}

export default function ActionList({ actions }: ActionListProps) {
  if (!actions.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">Action Items</h2>
      <ul className="space-y-2">
        {actions.map((action, i) => (
          <li key={i} className="flex gap-3 text-zinc-300">
            <span className="text-emerald-400 mt-0.5 shrink-0">&#9744;</span>
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
