"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface Props {
  sessionId: string;
  initialTitle: string;
  initialMentor: string;
  initialTopic: string;
  initialDate: string; // ISO string
}

export default function EditableSessionHeader({
  sessionId,
  initialTitle,
  initialMentor,
  initialTopic,
  initialDate,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [mentor, setMentor] = useState(initialMentor);
  const [topic, setTopic] = useState(initialTopic);
  const [date, setDate] = useState(initialDate.split("T")[0]);
  const [saving, setSaving] = useState(false);

  const formattedDate = new Date(initialDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, mentor, topic, date }),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(initialTitle);
    setMentor(initialMentor);
    setTopic(initialTopic);
    setDate(initialDate.split("T")[0]);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-3 p-4 bg-white/5 border-2 border-purple-400/30 wobbly-border">
        <div>
          <label className="text-xs text-white/40 block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/10 border-2 border-black wobbly-border-md px-3 py-2 text-white font-heading text-xl focus:outline-none focus:border-purple-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-white/40 block mb-1">Mentor / Source</label>
            <input
              type="text"
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
              className="w-full bg-white/10 border-2 border-black wobbly-border px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/10 border-2 border-black wobbly-border-md px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
              placeholder="e.g. Market Strategy"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/10 border-2 border-black wobbly-border px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !topic.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-400 text-black font-heading font-bold text-sm border-2 border-black hard-shadow wobbly-border hover:scale-105 transition-all disabled:opacity-50"
          >
            <Icon icon={saving ? "lucide:loader-2" : "lucide:check"} className={saving ? "animate-spin" : ""} width={14} />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <Icon icon="lucide:x" width={14} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-white">{initialTitle}</h1>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-white/30 hover:text-purple-400 hover:bg-purple-400/10 px-3 py-1.5 border border-white/10 wobbly-border-md text-sm transition-all opacity-0 group-hover:opacity-100"
          title="Edit session info"
        >
          <Icon icon="lucide:pencil" width={14} />
          Edit
        </button>
      </div>
      <p className="text-white/60 mt-2 text-lg">
        {initialMentor && (
          <>
            <span className="text-teal-400">{initialMentor}</span> &bull;{" "}
          </>
        )}
        {initialTopic} &bull; {formattedDate}
      </p>
    </div>
  );
}
