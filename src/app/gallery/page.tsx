"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Lightbox from "@/components/Lightbox";
import { useLanguage } from "@/components/LanguageProvider";

interface GalleryItem {
  url: string;
  caption?: string;
  location?: string;
  tags?: string[];
  slug?: string;   // only for post photos
  title?: string;
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-xs px-3 py-1 rounded-full transition-all"
      style={{
        background: active ? "rgba(255,45,107,0.15)" : "rgba(255,255,255,0.04)",
        color: active ? "var(--accent-pink)" : "var(--text-secondary)",
        border: `1px solid ${active ? "rgba(255,45,107,0.4)" : "var(--border)"}`,
      }}>
      {children}
    </button>
  );
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { t } = useLanguage();
  // standalone = photos without a post link, these open in lightbox
  const standaloneFiltered = (filteredItems: GalleryItem[]) => filteredItems.filter(i => !i.slug);

  useEffect(() => {
    fetch("/api/gallery").then(r => r.json()).then(setItems).catch(() => {});
  }, []);

  const allTags = Array.from(new Set(items.flatMap(i => i.tags ?? [])));
  const allLocations = Array.from(new Set(items.map(i => i.location).filter(Boolean))) as string[];

  const filtered = items.filter(img => {
    if (selectedTag && !(img.tags ?? []).includes(selectedTag)) return false;
    if (selectedLocation && img.location !== selectedLocation) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-14 max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t.galleryTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {t.gallerySubtitle}
        </p>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium mr-1" style={{ color: "var(--text-secondary)" }}>{t.place}</span>
            <FilterBtn active={!selectedLocation} onClick={() => setSelectedLocation(null)}>{t.allFilter}</FilterBtn>
            {allLocations.map(loc => (
              <FilterBtn key={loc} active={selectedLocation === loc} onClick={() => setSelectedLocation(loc === selectedLocation ? null : loc)}>
                {loc}
              </FilterBtn>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium mr-1" style={{ color: "var(--text-secondary)" }}>{t.topic}</span>
            <button onClick={() => setSelectedTag(null)} className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: !selectedTag ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)", color: !selectedTag ? "var(--accent-cyan)" : "var(--text-secondary)", border: `1px solid ${!selectedTag ? "rgba(0,212,255,0.3)" : "var(--border)"}` }}>
              {t.allFilter}
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className="text-xs px-3 py-1 rounded-full transition-all"
                style={{ background: selectedTag === tag ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)", color: selectedTag === tag ? "var(--accent-cyan)" : "var(--text-secondary)", border: `1px solid ${selectedTag === tag ? "rgba(0,212,255,0.3)" : "var(--border)"}` }}>
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
          <p className="text-4xl mb-3">📷</p>
          <p className="font-medium">{t.noPhotos}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{t.noPhotosText}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Keine Fotos für diese Kombination.</p>
      ) : (
        <>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((img, i) => {
              const inner = (
                <div className="relative group cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption ?? img.title ?? ""} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      {(img.title || img.caption) && <p className="text-xs font-medium text-white">{img.title ?? img.caption}</p>}
                      {img.location && <p className="text-xs text-white/70">{img.location}</p>}
                      {img.slug && <p className="text-xs text-white/50 mt-1">→ Post öffnen</p>}
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={i} className="break-inside-avoid rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {img.slug
                    ? <Link href={`/posts/${img.slug}`}>{inner}</Link>
                    : <div onClick={() => setLightboxIndex(standaloneFiltered(filtered).findIndex(s => s.url === img.url))}>{inner}</div>
                  }
                </div>
              );
            })}
          </div>

          {lightboxIndex !== null && (() => {
            const sa = standaloneFiltered(filtered);
            return (
              <Lightbox
                images={sa}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onNext={() => setLightboxIndex(i => i !== null && i < sa.length - 1 ? i + 1 : i)}
                onPrev={() => setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)}
              />
            );
          })()}
        </>
      )}
    </div>
  );
}
