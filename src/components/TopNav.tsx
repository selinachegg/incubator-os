"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function TopNav() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sessions?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 bg-[#0f1115] border-b-4 border-black px-8 py-4 flex items-center justify-between z-30">
      <form onSubmit={handleSearch} className="flex items-center gap-4 flex-1">
        <div className="relative w-1/2 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions, mentors, or insights..."
            className="w-full bg-white/5 border-2 border-black wobbly-border px-10 py-2 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 transition-all hard-shadow"
          />
          <Icon
            icon="lucide:search"
            className="absolute left-3 top-3 text-white/40 text-xl"
          />
        </div>
      </form>
      <div className="flex items-center gap-6">
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 bg-teal-400 text-black px-6 py-2 border-2 border-black wobbly-border-md font-heading font-bold hard-shadow hard-shadow-hover transition-all"
        >
          <Icon icon="lucide:plus" />
          New Session
        </Link>
      </div>
    </header>
  );
}
