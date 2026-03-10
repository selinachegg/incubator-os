import { prisma } from "@/lib/prisma";
import { Icon } from "@iconify/react";
import ActionBoard from "./ActionBoard";

export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const [actions, sessions] = await Promise.all([
    prisma.actionItem.findMany({
      include: {
        session: { select: { id: true, title: true, mentor: true, topic: true } },
      },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    }),
    prisma.session.findMany({
      select: { id: true, title: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const pending = actions.filter((a) => !a.completed);
  const completed = actions.filter((a) => a.completed);

  const stats = {
    total: actions.length,
    completed: completed.length,
    critical: pending.filter((a) => a.priority === "critical").length,
    high: pending.filter((a) => a.priority === "high").length,
  };

  const serialized = actions.map((a) => ({
    ...a,
    dueDate: a.dueDate?.toISOString() || null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl flex items-center gap-3">
          <Icon icon="lucide:check-circle-2" className="text-teal-400" />
          Action Board
        </h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total" value={stats.total} color="text-white" />
        <StatCard
          label="Completed"
          value={stats.completed}
          color="text-teal-400"
        />
        <StatCard
          label="Critical"
          value={stats.critical}
          color="text-red-400"
        />
        <StatCard label="High" value={stats.high} color="text-yellow-400" />
      </div>

      <ActionBoard actions={serialized} sessions={sessions} />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-4 bg-white/5 border-2 border-black wobbly-border hard-shadow text-center">
      <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
