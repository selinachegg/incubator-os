import Link from "next/link";
import { Icon } from "@iconify/react";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400",
  high: "text-yellow-400",
  medium: "text-blue-400",
  low: "text-white/40",
};

const BORDER_COLORS = [
  "border-teal-400/50 group-hover:border-teal-400",
  "border-yellow-400/50 group-hover:border-yellow-400",
  "border-purple-400/50 group-hover:border-purple-400",
  "border-red-400/50 group-hover:border-red-400",
];

const CHECK_COLORS = ["text-teal-400", "text-yellow-400", "text-purple-400", "text-red-400"];
const WOBBLES = ["wobbly-border", "wobbly-border-md"];

interface PendingActionsProps {
  actions: { text: string; sessionTitle: string; priority: string }[];
}

export default function PendingActions({ actions }: PendingActionsProps) {
  if (!actions.length) return null;

  return (
    <section className="p-8 bg-black/40 border-[3px] border-dashed border-teal-400/50 wobbly-border-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-2xl flex items-center gap-3">
          <Icon icon="lucide:check-square" className="text-teal-400" />
          Pending Action Items
        </h3>
        <Link
          href="/actions"
          className="text-teal-400 hover:underline text-sm flex items-center gap-1"
        >
          {actions.length} task{actions.length !== 1 ? "s" : ""} remaining &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.slice(0, 8).map((action, i) => (
          <div
            key={i}
            className={`p-4 bg-white/5 border-2 border-black ${WOBBLES[i % 2]} hard-shadow flex gap-3 group cursor-pointer hover:bg-white/10 transition-all`}
          >
            <div
              className={`w-6 h-6 border-2 ${BORDER_COLORS[i % BORDER_COLORS.length]} rounded shrink-0 flex items-center justify-center mt-1 transition-colors`}
            >
              <Icon
                icon="lucide:check"
                className={`${CHECK_COLORS[i % CHECK_COLORS.length]} hidden group-hover:block`}
              />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">{action.text}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-white/40">From: {action.sessionTitle}</p>
                <span className={`text-[10px] font-bold ${PRIORITY_COLORS[action.priority] || "text-white/40"}`}>
                  {action.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
