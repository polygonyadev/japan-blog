"use client";
import { useState } from "react";
import { POSTS } from "@/lib/data";

const allTags = Array.from(new Set(POSTS.flatMap(p => p.tags)));
const allLocations = Array.from(new Set(POSTS.map(p => p.location)));

export default function GalleryPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const filtered = POSTS.filter(p => {
    if (selectedTag && !p.tags.includes(selectedTag)) return false;
    if (selectedLocation && p.location !== selectedLocation) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-14 max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Galerie 📸</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Alle Fotos — filterbar nach Ort und Thema
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium mr-1" style={{ color: "var(--text-secondary)" }}>Ort:</span>
          <button
            onClick={() => setSelectedLocation(null)}
            className="text-xs px-3 py-1 rounded-full transition-all"
            style={{
              background: !selectedLocation ? "rgba(255,45,107,0.15)" : "rgba(255,255,255,0.04)",
              color: !selectedLocation ? "var(--accent-pink)" : "var(--text-secondary)",
              border: `1px solid ${!selectedLocation ? "rgba(255,45,107,0.4)" : "var(--border)"}`,
            }}
          >
            Alle
          </button>
          {allLocations.map(loc => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc === selectedLocation ? null : loc)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: selectedLocation === loc ? "rgba(255,45,107,0.15)" : "rgba(255,255,255,0.04)",
                color: selectedLocation === loc ? "var(--accent-pink)" : "var(--text-secondary)",
                border: `1px solid ${selectedLocation === loc ? "rgba(255,45,107,0.4)" : "var(--border)"}`,
              }}
            >
              {loc}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium mr-1" style={{ color: "var(--text-secondary)" }}>Thema:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className="text-xs px-3 py-1 rounded-full transition-all"
            style={{
              background: !selectedTag ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
              color: !selectedTag ? "var(--accent-cyan)" : "var(--text-secondary)",
              border: `1px solid ${!selectedTag ? "rgba(0,212,255,0.3)" : "var(--border)"}`,
            }}
          >
            Alle
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: selectedTag === tag ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
                color: selectedTag === tag ? "var(--accent-cyan)" : "var(--text-secondary)",
                border: `1px solid ${selectedTag === tag ? "rgba(0,212,255,0.3)" : "var(--border)"}`,
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Keine Fotos gefunden.</p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.flatMap(post =>
            post.images.length > 0
              ? post.images.map((img, i) => (
                  <div
                    key={`${post.id}-${i}`}
                    className="break-inside-avoid rounded-xl overflow-hidden relative group"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={post.title} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-xs font-medium">{post.location}</span>
                    </div>
                  </div>
                ))
              : [
                  <div
                    key={post.id}
                    className="break-inside-avoid rounded-xl overflow-hidden relative group flex items-center justify-center"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      minHeight: "120px",
                      aspectRatio: Math.random() > 0.5 ? "4/3" : "3/4",
                    }}
                  >
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">📷</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.location}</div>
                      <div className="text-xs mt-1 font-medium">{post.title}</div>
                    </div>
                  </div>,
                ]
          )}
        </div>
      )}
    </div>
  );
}
