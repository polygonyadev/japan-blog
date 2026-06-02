"use client";
import Link from "next/link";
import { ArrowRight, MapPin, Mail, Coffee } from "lucide-react";
import StatsBar from "@/components/StatsBar";
import PostCard from "@/components/PostCard";
import MiniMap from "@/components/MiniMap";
import TokyoTime from "@/components/TokyoTime";
import { useLanguage } from "@/components/LanguageProvider";
import { type Post } from "@/lib/data";

interface Props {
  posts: Post[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bucketItems: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
}

export default function HomeClient({ posts, bucketItems, settings, stats }: Props) {
  const { t } = useLanguage();

  const latestPosts = posts.slice(0, 3);
  const nextDestinations = bucketItems.filter((b: { done: boolean }) => !b.done).slice(0, 3);
  const mapMarkers = posts
    .filter((p: Post) => p.lat && p.lng)
    .map((p: Post) => ({ lat: p.lat!, lng: p.lng!, label: p.location ?? "", slug: p.slug }));

  return (
    <div className="min-h-screen pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
          <span className="text-[20rem] font-bold opacity-[0.03] leading-none" style={{ color: "var(--accent-pink)" }}>旅</span>
        </div>

        <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
              Nippon{" "}
              <span style={{ color: "var(--accent-cyan)" }}>Diary</span>
            </h1>
            <TokyoTime />
          </div>

          <p className="text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>
            {t.heroSubtitle}
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <Link href="/posts"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 glow-cyan"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              {t.allPosts} <ArrowRight size={15} />
            </Link>
            <Link href="/map"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 glass"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <MapPin size={15} /> {t.openMap}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 flex flex-col gap-12 pb-20">
        <StatsBar
          departureDate={settings.departureDate ?? null}
          citiesVisited={stats.citiesCount}
          photosUploaded={stats.photosCount}
          postsWritten={stats.postsCount}
        />

        {/* Latest posts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t.latestPosts}</h2>
            <Link href="/posts" className="text-sm flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "var(--text-secondary)" }}>
              {t.viewAll} <ArrowRight size={13} />
            </Link>
          </div>
          {latestPosts.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
              <p className="text-4xl mb-3">✈️</p>
              <p className="font-medium">{t.tripSoonTitle}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{t.tripSoonText}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestPosts.map((p: Post) => <PostCard key={p.slug} post={p} />)}
            </div>
          )}
        </section>

        {/* Map */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t.myRoute}</h2>
            <Link href="/map" className="text-sm flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "var(--text-secondary)" }}>
              {t.fullscreen} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <MiniMap markers={mapMarkers} height="320px" />
          </div>
        </section>

        {/* Next destinations */}
        {nextDestinations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t.plannedNext}</h2>
              <Link href="/bucket-list" className="text-sm flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "var(--text-secondary)" }}>
                {t.showAll} <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {nextDestinations.map((item: { _id: string; title: string; description?: string; location?: string }) => (
                <div key={item._id} className="glass rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform" style={{ border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: "var(--accent-cyan)" }} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  {item.description && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.description}</p>}
                  {item.location && <span className="text-xs" style={{ color: "var(--accent-cyan)" }}>{item.location}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter + Support CTA */}
        <section className="text-center py-6">
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{t.supportText}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/community#newsletter"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 glow-cyan"
              style={{ background: "var(--accent-cyan)", color: "#0d1117", minWidth: "180px" }}
            >
              <Mail size={15} /> {t.newsletterTitle}
            </Link>
            <Link
              href="https://ko-fi.com/davidae"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
              style={{ background: "#FF5E5B", color: "#ffffff", boxShadow: "0 2px 12px rgba(255,94,91,0.3)", minWidth: "180px" }}
            >
              <Coffee size={15} /> Support on Ko-fi
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
