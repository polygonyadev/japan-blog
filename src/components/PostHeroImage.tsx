"use client";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";

export default function PostHeroImage({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="w-full h-64 sm:h-96 relative overflow-hidden cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, var(--bg-primary))" }} />
      </div>
      {open && (
        <Lightbox
          images={[{ url }]}
          index={0}
          onClose={() => setOpen(false)}
          onNext={() => {}}
          onPrev={() => {}}
        />
      )}
    </>
  );
}
