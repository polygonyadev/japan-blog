"use client";
import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { url: string; caption?: string }[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ images, index, onClose, onNext, onPrev }: LightboxProps) {
  const current = images[index];
  const hasMultiple = images.length > 1;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
      >
        <X size={22} />
      </button>

      {/* Prev */}
      {hasMultiple && (
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 p-3 rounded-full transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-5xl max-h-[90vh] mx-16 flex flex-col items-center gap-3"
        onClick={e => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.caption ?? ""}
          className="max-h-[80vh] max-w-full object-contain rounded-xl"
          style={{ boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
        />
        {current.caption && (
          <p className="text-sm text-white/70 text-center">{current.caption}</p>
        )}
        {hasMultiple && (
          <p className="text-xs text-white/40">{index + 1} / {images.length}</p>
        )}
      </div>

      {/* Next */}
      {hasMultiple && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 p-3 rounded-full transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
