"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import RichEditor from "./RichEditor";

interface EditableNotesProps {
  sessionId: string;
  initialNotes: string;
}

export default function EditableNotes({
  sessionId,
  initialNotes,
}: EditableNotesProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawNotes: notes }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        alert("Failed to save");
      }
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleFixWriting(): Promise<string | null> {
    if (!notes.trim()) return null;
    setFixing(true);
    try {
      const res = await fetch("/api/fix-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes, isHtml: true }),
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

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      // Save notes first if editing
      if (editing) {
        await fetch(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawNotes: notes }),
        });
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Analysis failed");
      }
    } catch {
      alert("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  if (!editing) {
    return (
      <div className="border-t-4 border-black pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl text-white/70 flex items-center gap-2">
            <Icon icon="lucide:file-text" />
            Raw Notes
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 bg-white/10 text-white/70 border border-white/20 px-3 py-1.5 wobbly-border text-sm hover:bg-white/20 transition-all"
          >
            <Icon icon="lucide:pencil" />
            Edit
          </button>
        </div>
        <div
          className="tiptap text-sm text-white/60 bg-white/5 p-6 border-2 border-black wobbly-border-md hard-shadow font-body"
          dangerouslySetInnerHTML={{ __html: initialNotes }}
        />
      </div>
    );
  }

  return (
    <div className="border-t-4 border-black pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-xl text-yellow-400 flex items-center gap-2">
          <Icon icon="lucide:file-edit" />
          Editing Notes
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNotes(initialNotes);
              setEditing(false);
            }}
            className="flex items-center gap-1.5 bg-white/10 text-white/50 border border-white/20 px-3 py-1.5 wobbly-border-md text-sm hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-teal-400 text-black border-2 border-black px-3 py-1.5 wobbly-border text-sm font-bold hard-shadow hard-shadow-hover transition-all disabled:opacity-50"
          >
            <Icon icon="lucide:save" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <RichEditor
        content={notes}
        onChange={setNotes}
        placeholder="Edit your notes..."
        onFixWriting={handleFixWriting}
        isFixing={fixing}
        onAnalyze={handleAnalyze}
        isAnalyzing={analyzing}
      />
    </div>
  );
}
