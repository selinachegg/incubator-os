import Link from "next/link";
import { Icon } from "@iconify/react";

interface AiInsightHeroProps {
  mentorNames: string[];
  topTag: string | null;
  sessionCount: number;
}

export default function AiInsightHero({
  mentorNames,
  topTag,
  sessionCount,
}: AiInsightHeroProps) {
  const mentorList = mentorNames.slice(0, 2);
  const hasData = sessionCount > 0;

  return (
    <section className="relative">
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-400 rounded-full border-2 border-black z-10 flex items-center justify-center rotate-12 hard-shadow animate-bounce-subtle">
        <Icon icon="lucide:sparkles" className="text-black text-2xl" />
      </div>
      <div className="p-8 bg-purple-500/10 border-[3px] border-purple-400 wobbly-border hard-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />
        <h2 className="font-heading text-3xl text-purple-400 mb-4 flex items-center gap-3">
          AI Strategic Insights
          <span className="text-sm font-body bg-purple-400/20 text-purple-300 px-3 py-1 wobbly-border border border-purple-400/30">
            Overview
          </span>
        </h2>
        {hasData ? (
          <p className="text-xl mb-6 leading-relaxed max-w-4xl text-white/90">
            You have <span className="font-bold text-yellow-400">{sessionCount} sessions</span> logged
            {mentorList.length > 0 && (
              <>
                {" "}with mentors including{" "}
                {mentorList.map((name, i) => (
                  <span key={name}>
                    {i > 0 && " and "}
                    <span className="underline decoration-dashed decoration-teal-400">
                      {name}
                    </span>
                  </span>
                ))}
              </>
            )}
            .{topTag && (
              <>
                {" "}Your most discussed topic is{" "}
                <span className="font-bold text-yellow-400">{topTag}</span>.
              </>
            )}
          </p>
        ) : (
          <p className="text-xl mb-6 leading-relaxed max-w-4xl text-white/90">
            Welcome to Incubator OS! Start by creating your first session note
            and analyzing it with AI to build your knowledge base.
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link href="/insights" className="bg-white/10 hover:bg-white/20 border-2 border-purple-400/50 px-4 py-2 wobbly-border transition-all flex items-center gap-2 text-white">
            <Icon icon="lucide:trending-up" />
            View All Insights
          </Link>
        </div>
      </div>
    </section>
  );
}
