"use client";

import { Icon } from "@iconify/react";

interface DiffViewProps {
  before: string;
  after: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function DiffView({
  before,
  after,
  onAccept,
  onReject,
}: DiffViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#16181d] border-4 border-black wobbly-border hard-shadow max-w-5xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <h2 className="font-heading text-2xl text-purple-400 flex items-center gap-2">
            <Icon icon="lucide:wand-2" />
            AI Writing Fix — Review Changes
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 bg-red-400/20 text-red-400 border-2 border-red-400/30 px-4 py-2 wobbly-border font-heading font-bold hard-shadow hard-shadow-hover transition-all"
            >
              <Icon icon="lucide:x" />
              Reject
            </button>
            <button
              onClick={onAccept}
              className="flex items-center gap-1.5 bg-teal-400 text-black border-2 border-black px-4 py-2 wobbly-border-md font-heading font-bold hard-shadow hard-shadow-hover transition-all"
            >
              <Icon icon="lucide:check" />
              Accept
            </button>
          </div>
        </div>

        {/* Diff panels */}
        <div className="flex-1 grid grid-cols-2 divide-x-2 divide-black overflow-hidden min-h-0">
          {/* Before */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-red-400/10 border-b border-red-400/20 flex items-center gap-2 shrink-0">
              <Icon icon="lucide:file-minus" className="text-red-400" />
              <span className="font-heading text-red-400">Before</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div
                className="tiptap text-sm text-white/60"
                dangerouslySetInnerHTML={{ __html: before }}
              />
            </div>
          </div>

          {/* After */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-teal-400/10 border-b border-teal-400/20 flex items-center gap-2 shrink-0">
              <Icon icon="lucide:file-plus" className="text-teal-400" />
              <span className="font-heading text-teal-400">After (AI Fixed)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div
                className="tiptap text-sm text-white/90"
                dangerouslySetInnerHTML={{ __html: after }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
