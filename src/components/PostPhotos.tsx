"use client";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";

interface Photo { url: string; caption?: string }

export default function PostPhotos({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  if (!photos || photos.length === 0) return null;

  // First photo is used as hero, show rest here
  const rest = photos.slice(1);
  if (rest.length === 0) return null;

  return (
    <>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rest.map((photo, i) => (
          <figure key={i} className="cursor-pointer group" onClick={() => setLightboxIndex(i + 1)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption ?? ""}
              className="w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              style={{ border: "1px solid var(--border)" }}
            />
            {photo.caption && (
              <figcaption className="text-xs mt-1 text-center" style={{ color: "var(--text-secondary)" }}>
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex(i => i !== null && i < photos.length - 1 ? i + 1 : i)}
          onPrev={() => setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)}
        />
      )}
    </>
  );
}
