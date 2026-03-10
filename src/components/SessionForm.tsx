"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import RichEditor from "./RichEditor";

export default function SessionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [rawNotes, setRawNotes] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rawNotes.trim() || rawNotes === "<p></p>") {
      alert("Please add some notes");
      return;
    }
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title"),
      date: form.get("date"),
      mentor: form.get("mentor") || "",
      topic: form.get("topic"),
      rawNotes,
    };

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } else {
      setLoading(false);
      alert("Failed to create session");
    }
  }

  async function handleFixWriting(): Promise<string | null> {
    if (!rawNotes.trim()) return null;
    setFixing(true);
    try {
      const res = await fetch("/api/fix-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawNotes, isHtml: true }),
      });
      if (res.ok) {
        const { fixed } = await res.json();
        return fixed;
      }
      const data = await res.json();
      alert(data.error || "Fix spelling failed");
      return null;
    } catch {
      alert("Fix spelling failed — check your AI settings");
      return null;
    } finally {
      setFixing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label className="block font-heading text-lg text-white mb-1">
          Title
        </label>
        <input
          name="title"
          required
          className="w-full bg-white/5 border-2 border-black wobbly-border px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all hard-shadow"
          placeholder="e.g. GTM Strategy Workshop"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-heading text-lg text-white mb-1">
            Date
          </label>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full bg-white/5 border-2 border-black wobbly-border-md px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all hard-shadow"
          />
        </div>
        <div>
          <label className="block font-heading text-lg text-white mb-1">
            Mentor <span className="text-white/30 text-sm">(optional)</span>
          </label>
          <input
            name="mentor"
            className="w-full bg-white/5 border-2 border-black wobbly-border px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all hard-shadow"
            placeholder="Mentor name"
          />
        </div>
        <div>
          <label className="block font-heading text-lg text-white mb-1">
            Topic
          </label>
          <input
            name="topic"
            required
            className="w-full bg-white/5 border-2 border-black wobbly-border-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all hard-shadow"
            placeholder="e.g. Go-to-Market"
          />
        </div>
      </div>

      <div>
        <label className="block font-heading text-lg text-white mb-2">
          Notes
        </label>
        <RichEditor
          content={rawNotes}
          onChange={setRawNotes}
          placeholder="Start writing your session notes... Use the toolbar for formatting, paste images with Ctrl+V, or click the image icon."
          onFixWriting={handleFixWriting}
          isFixing={fixing}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-teal-400 text-black px-8 py-3 border-2 border-black wobbly-border-md font-heading font-bold text-lg hard-shadow hard-shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon icon="lucide:save" />
        {loading ? "Saving..." : "Save Session"}
      </button>
    </form>
  );
}
