"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";

interface ImageResizerProps {
  src: string;
  currentWidth?: number;
  onResize: (width: number) => void;
  onRemove: () => void;
  onCrop: (cropData: { x: number; y: number; w: number; h: number }) => void;
}

const PRESET_SIZES = [
  { label: "S", width: 200 },
  { label: "M", width: 400 },
  { label: "L", width: 600 },
  { label: "Full", width: 0 },
];

export default function ImageResizer({
  src,
  currentWidth,
  onResize,
  onRemove,
}: ImageResizerProps) {
  const [showControls, setShowControls] = useState(false);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      startX.current = e.clientX;
      startWidth.current = currentWidth || containerRef.current?.offsetWidth || 400;

      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX.current;
        const newWidth = Math.max(100, Math.min(900, startWidth.current + diff));
        onResize(newWidth);
      };

      const handleMouseUp = () => {
        setDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [currentWidth, onResize]
  );

  return (
    <div
      ref={containerRef}
      className="relative inline-block group my-2"
      style={{ width: currentWidth ? `${currentWidth}px` : "100%" }}
      onClick={() => setShowControls(!showControls)}
    >
      <img
        src={src}
        alt=""
        className="w-full h-auto border-2 border-black wobbly-border hard-shadow"
        draggable={false}
      />

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize bg-yellow-400/0 hover:bg-yellow-400/30 transition-colors flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <div
          className={`w-1 h-8 rounded bg-yellow-400 ${
            dragging ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          } transition-opacity`}
        />
      </div>

      {/* Controls overlay */}
      {showControls && (
        <div
          className="absolute top-2 left-2 flex gap-1 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {PRESET_SIZES.map((size) => (
            <button
              key={size.label}
              onClick={() => onResize(size.width)}
              className={`px-2 py-1 text-xs font-bold border border-black hard-shadow transition-all ${
                (size.width === 0 && !currentWidth) ||
                currentWidth === size.width
                  ? "bg-yellow-400 text-black"
                  : "bg-black/70 text-white hover:bg-black/90"
              }`}
            >
              {size.label}
            </button>
          ))}
          <button
            onClick={onRemove}
            className="px-2 py-1 text-xs font-bold bg-red-400 text-black border border-black hard-shadow hover:bg-red-300 transition-all"
            title="Remove image"
          >
            <Icon icon="lucide:trash-2" width={12} />
          </button>
        </div>
      )}
    </div>
  );
}
