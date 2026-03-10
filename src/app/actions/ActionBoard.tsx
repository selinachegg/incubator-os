"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface ActionData {
  id: string;
  text: string;
  completed: boolean;
  priority: string;
  dueDate: string | null;
  notes: string | null;
  sessionId: string;
  session: { id: string; title: string; mentor: string; topic: string };
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-400/20",
    border: "border-red-400/30",
    icon: "lucide:alert-triangle",
  },
  high: {
    label: "High",
    color: "text-yellow-400",
    bg: "bg-yellow-400/20",
    border: "border-yellow-400/30",
    icon: "lucide:arrow-up",
  },
  medium: {
    label: "Medium",
    color: "text-blue-400",
    bg: "bg-blue-400/20",
    border: "border-blue-400/30",
    icon: "lucide:minus",
  },
  low: {
    label: "Low",
    color: "text-white/40",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: "lucide:arrow-down",
  },
};

const WOBBLES = ["wobbly-border", "wobbly-border-md"];

export default function ActionBoard({
  actions,
  sessions,
}: {
  actions: ActionData[];
  sessions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<Record<string, string>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newSessionId, setNewSessionId] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!newText.trim() || !newSessionId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newText.trim(),
          sessionId: newSessionId,
          priority: newPriority,
        }),
      });
      if (res.ok) {
        setNewText("");
        setNewPriority("medium");
        setShowNewForm(false);
        router.refresh();
      }
    } catch {
      alert("Failed to create action");
    } finally {
      setCreating(false);
    }
  }

  const filtered = actions.filter((a) => {
    if (filter === "pending") return !a.completed;
    if (filter === "completed") return a.completed;
    return true;
  });

  const pending = filtered.filter((a) => !a.completed);
  const completed = filtered.filter((a) => a.completed);

  async function toggleComplete(id: string, current: boolean) {
    await fetch(`/api/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !current }),
    });
    router.refresh();
  }

  async function setPriority(id: string, priority: string) {
    await fetch(`/api/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    router.refresh();
  }

  async function deleteAction(id: string) {
    await fetch(`/api/actions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function expandWithAi(action: ActionData) {
    if (expandedContent[action.id]) {
      setExpandedContent((prev) => {
        const next = { ...prev };
        delete next[action.id];
        return next;
      });
      return;
    }

    setExpandingId(action.id);
    try {
      const res = await fetch("/api/expand-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionItem: action.text,
          sessionContext: `Session: ${action.session.title}\nTopic: ${action.session.topic}\nMentor: ${action.session.mentor}`,
        }),
      });
      if (res.ok) {
        const { expanded } = await res.json();
        setExpandedContent((prev) => ({ ...prev, [action.id]: expanded }));
      }
    } catch {
      // silent
    } finally {
      setExpandingId(null);
    }
  }

  function renderAction(action: ActionData, i: number) {
    const pri = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.medium;
    const isExpanding = expandingId === action.id;

    return (
      <div key={action.id}>
        <div
          className={`p-4 bg-white/5 border-2 border-black ${WOBBLES[i % 2]} hard-shadow transition-all hover:bg-white/8 ${
            action.completed ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={() => toggleComplete(action.id, action.completed)}
              className={`w-6 h-6 border-2 rounded shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                action.completed
                  ? "bg-teal-400 border-teal-400"
                  : `${pri.border} hover:border-teal-400`
              }`}
            >
              {action.completed && (
                <Icon icon="lucide:check" className="text-black text-sm" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold ${
                  action.completed
                    ? "line-through text-white/40"
                    : "text-white/90"
                }`}
              >
                {action.text}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Link
                  href={`/sessions/${action.session.id}`}
                  className="text-xs text-white/40 hover:text-teal-400 transition-colors"
                >
                  {action.session.title}
                </Link>

                {/* Priority selector */}
                <div className="flex gap-1">
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setPriority(action.id, key)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold border transition-all ${
                        action.priority === key
                          ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                          : "bg-transparent border-transparent text-white/20 hover:text-white/50"
                      }`}
                      title={cfg.label}
                    >
                      {cfg.label[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Expand with AI */}
              {!action.completed && (
                <button
                  onClick={() => expandWithAi(action)}
                  disabled={isExpanding}
                  className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-1 wobbly-border hover:bg-purple-500/30 transition-all disabled:opacity-40"
                  title="Expand into subtasks with AI"
                >
                  <Icon
                    icon={
                      isExpanding
                        ? "lucide:loader-2"
                        : expandedContent[action.id]
                          ? "lucide:chevron-up"
                          : "lucide:sparkles"
                    }
                    className={isExpanding ? "animate-spin" : ""}
                    width={14}
                  />
                  {isExpanding
                    ? ""
                    : expandedContent[action.id]
                      ? "Hide"
                      : "AI Plan"}
                </button>
              )}
              {/* Delete */}
              <button
                onClick={() => deleteAction(action.id)}
                className="flex items-center text-xs text-red-400/50 hover:text-red-400 hover:bg-red-400/10 px-1.5 py-1 transition-all"
                title="Delete action"
              >
                <Icon icon="lucide:trash-2" width={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded AI plan */}
        {expandedContent[action.id] && (
          <div className="ml-9 mt-2 p-4 bg-purple-500/5 border-l-4 border-purple-400/40 text-white/80 text-sm whitespace-pre-wrap font-body mb-2">
            {expandedContent[action.id]}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* New Action Button + Form */}
      <div className="mb-6">
        {!showNewForm ? (
          <button
            onClick={() => {
              setShowNewForm(true);
              if (sessions.length > 0 && !newSessionId) setNewSessionId(sessions[0].id);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-400 text-black border-2 border-black font-heading font-bold text-sm hard-shadow hard-shadow-hover wobbly-border transition-all"
          >
            <Icon icon="lucide:plus" width={16} />
            New Action
          </button>
        ) : (
          <div className="p-4 bg-white/5 border-2 border-black wobbly-border hard-shadow space-y-3">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-white/5 border-2 border-black wobbly-border-md px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-400 font-body"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={newSessionId}
                onChange={(e) => setNewSessionId(e.target.value)}
                className="bg-white/5 border-2 border-black wobbly-border px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-teal-400 font-body"
              >
                <option value="" disabled>
                  Link to session...
                </option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-1">
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setNewPriority(key)}
                    className={`px-2 py-1 text-xs font-bold border transition-all wobbly-border ${
                      newPriority === key
                        ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                        : "bg-transparent border-white/10 text-white/30 hover:text-white/50"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-3 py-1.5 text-sm text-white/50 border border-white/20 wobbly-border-md hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newText.trim() || !newSessionId}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-400 text-black border-2 border-black font-bold text-sm wobbly-border hard-shadow transition-all disabled:opacity-50"
                >
                  <Icon icon="lucide:plus" width={14} />
                  {creating ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 border-2 border-black font-heading text-sm hard-shadow transition-all ${
              filter === f
                ? "bg-yellow-400 text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            } ${f === "all" ? "wobbly-border" : "wobbly-border-md"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="p-12 bg-white/5 border-2 border-dashed border-white/20 wobbly-border text-center">
          <Icon
            icon="lucide:check-circle-2"
            className="text-white/20 text-5xl mx-auto mb-4"
          />
          <p className="text-white/50 text-lg">
            {actions.length === 0
              ? "No action items yet. Create one above or analyze a session!"
              : "No actions match this filter."}
          </p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="font-heading text-lg text-yellow-400 mb-3 flex items-center gap-2">
            <Icon icon="lucide:clock" />
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">{pending.map(renderAction)}</div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-heading text-lg text-teal-400 mb-3 flex items-center gap-2">
            <Icon icon="lucide:check-circle-2" />
            Completed ({completed.length})
          </h3>
          <div className="space-y-3">{completed.map(renderAction)}</div>
        </div>
      )}
    </div>
  );
}
