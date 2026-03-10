"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface ActionListProps {
  actions: string[];
  sessionContext?: string;
}

export default function ActionList({ actions, sessionContext }: ActionListProps) {
  const [expanded, setExpanded] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  if (!actions.length) return null;

  async function handleExpand(index: number, actionText: string) {
    if (expanded[index]) {
      // Toggle off
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      return;
    }

    setLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const res = await fetch("/api/expand-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionItem: actionText,
          sessionContext: sessionContext || "",
        }),
      });
      if (res.ok) {
        const { expanded: expandedText } = await res.json();
        setExpanded((prev) => ({ ...prev, [index]: expandedText }));
      }
    } catch {
      // silently fail
    } finally {
      setLoading((prev) => ({ ...prev, [index]: false }));
    }
  }

  return (
    <div>
      <h2 className="font-heading text-xl text-teal-400 mb-3 flex items-center gap-2">
        <Icon icon="lucide:check-square" />
        Action Items
      </h2>
      <ul className="space-y-3">
        {actions.map((action, i) => (
          <li key={i}>
            <div
              className={`flex gap-3 text-white/90 p-3 bg-white/5 border-2 border-black ${i % 2 === 0 ? "wobbly-border-md" : "wobbly-border"} hard-shadow group cursor-pointer hover:bg-white/10 transition-all`}
            >
              <div className="w-5 h-5 border-2 border-teal-400/50 rounded shrink-0 flex items-center justify-center mt-0.5 group-hover:border-teal-400 transition-colors">
                <Icon
                  icon="lucide:check"
                  className="text-teal-400 hidden group-hover:block text-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span>{action}</span>
              </div>
              <button
                onClick={() => handleExpand(i, action)}
                disabled={loading[i]}
                className="shrink-0 flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-1 wobbly-border hover:bg-purple-500/30 transition-all disabled:opacity-40"
                title="Expand with AI"
              >
                <Icon
                  icon={loading[i] ? "lucide:loader-2" : expanded[i] ? "lucide:chevron-up" : "lucide:sparkles"}
                  className={loading[i] ? "animate-spin" : ""}
                />
                {loading[i] ? "" : expanded[i] ? "Hide" : "Expand"}
              </button>
            </div>
            {expanded[i] && (
              <div className="ml-8 mt-2 p-4 bg-purple-500/5 border-l-4 border-purple-400/40 text-white/80 text-sm whitespace-pre-wrap font-body">
                {expanded[i]}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
