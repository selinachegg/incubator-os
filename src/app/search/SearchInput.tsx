"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function SearchInput({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything — notes, insights, actions, mentors, tags..."
          className="w-full bg-white/5 border-2 border-black wobbly-border px-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all hard-shadow text-lg"
        />
        <Icon
          icon="lucide:search"
          className="absolute left-4 top-4 text-white/40 text-xl"
        />
      </div>
      <button
        type="submit"
        className="bg-yellow-400 text-black px-6 py-3 border-2 border-black wobbly-border-md font-heading font-bold hard-shadow hard-shadow-hover transition-all"
      >
        Search
      </button>
    </form>
  );
}
