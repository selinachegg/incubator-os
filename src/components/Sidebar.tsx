"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const navItems = [
  { href: "/", icon: "lucide:layout-dashboard", label: "Dashboard" },
  { href: "/sessions", icon: "lucide:mic", label: "Sessions" },
  { href: "/actions", icon: "lucide:check-circle-2", label: "Actions" },
  { href: "/insights", icon: "lucide:lightbulb", label: "Insights" },
  { href: "/search", icon: "lucide:search", label: "Search" },
  { href: "/settings", icon: "lucide:settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r-4 border-black glass-dark flex flex-col z-40 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 border-2 border-black rotate-[-3deg] flex items-center justify-center wobbly-border hard-shadow">
          <Icon icon="lucide:box" className="text-black text-2xl" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
          Incubator OS
        </h1>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          const wobble = navItems.indexOf(item) % 2 === 0 ? "wobbly-border" : "wobbly-border-md";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 ${wobble} border-2 transition-all ${
                isActive
                  ? "bg-white/5 border-dashed border-white/20 text-yellow-400 hard-shadow"
                  : "border-transparent hover:bg-white/5 hover:border-dashed hover:border-white/20"
              }`}
            >
              <Icon icon={item.icon} className="text-xl" />
              <span className={isActive ? "font-heading text-lg" : "text-lg"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 bg-white/5 border-2 border-dashed border-white/20 wobbly-border text-xs text-white/50">
          <p>Accelerator: Incubator Program</p>
          <p>Status: Active</p>
        </div>
      </div>
    </aside>
  );
}
