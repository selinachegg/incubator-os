"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
    router.push("/sessions");
  }

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 px-3 py-1.5 border border-red-400/20 wobbly-border-md text-sm transition-all"
      title="Delete session"
    >
      <Icon icon="lucide:trash-2" width={14} />
      Delete
    </button>
  );
}
