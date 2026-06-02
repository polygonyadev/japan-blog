"use client";
import { useLanguage } from "@/components/LanguageProvider";
import MapClient from "./MapClient";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SEASON_INFO } from "@/lib/data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MapPageClient({ posts, bucketItems }: { posts: any[]; bucketItems: any[] }) {
  const { t } = useLanguage();

  const postMarkers = posts
    .filter((p: { lat?: number; lng?: number }) => p.lat && p.lng)
    .map((p: { lat: number; lng: number; location?: string; slug: string; title: string }) => ({
      lat: p.lat, lng: p.lng, label: p.location ?? "", slug: p.slug, title: p.title, type: "post" as const,
    }));

  const bucketMarkers = bucketItems
    .filter((b: { lat?: number; lng?: number; done: boolean }) => b.lat && b.lng && !b.done)
    .map((b: { lat: number; lng: number; title: string }) => ({
      lat: b.lat, lng: b.lng, label: b.title, title: b.title, type: "bucket" as const,
    }));

  return (
    <div className="min-h-screen pt-14 max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t.mapTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{t.mapSubtitle}</p>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-pink)" }} />
          {t.visitedPlaces} ({postMarkers.length})
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-cyan)" }} />
          {t.plannedNext.replace(" 📍", "")} ({bucketMarkers.length})
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden mb-8" style={{ border: "1px solid var(--border)" }}>
        <MapClient markers={[...postMarkers, ...bucketMarkers]} height="500px" />
      </div>

      {posts.filter((p: { lat?: number }) => p.lat).length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">{t.visitedPlaces}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {posts
              .filter((p: { lat?: number }) => p.lat)
              .map((post: { slug: string; location?: string; date: string; season?: string; title: string }) => {
                const season = post.season ? SEASON_INFO[post.season as keyof typeof SEASON_INFO] : null;
                return (
                  <Link key={post.slug} href={`/posts/${post.slug}`}
                    className="glass rounded-xl p-4 flex items-start gap-3 hover:scale-[1.01] transition-transform"
                    style={{ border: "1px solid var(--border)" }}>
                    <MapPin size={16} style={{ color: "var(--accent-pink)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div className="font-medium text-sm">{post.location}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {new Date(post.date).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                        {season && <>{" · "}{season.emoji} {season.label}</>}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{post.title}</div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
