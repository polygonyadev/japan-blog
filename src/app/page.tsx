import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import StatsBar from "@/components/StatsBar";
import PostCard from "@/components/PostCard";
import MiniMap from "@/components/MiniMap";
import BuyMeCoffee from "@/components/BuyMeCoffee";
import { POSTS, BUCKET_LIST } from "@/lib/data";

const nextDestinations = BUCKET_LIST.filter(b => !b.done).slice(0, 3);

export default function Home() {
  const latestPosts = POSTS.slice(0, 3);

  return (
    <div className="min-h-screen pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden
        >
          <span className="text-[20rem] font-bold opacity-[0.03] leading-none" style={{ color: "var(--accent-pink)" }}>
            旅
          </span>
        </div>

        <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
            style={{ background: "rgba(255,45,107,0.1)", border: "1px solid rgba(255,45,107,0.25)", color: "var(--accent-pink)" }}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Gerade in Japan 🇯🇵
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Ein Jahr in{" "}
            <span style={{ color: "var(--accent-cyan)" }}>Japan</span>
          </h1>

          <p className="text-lg max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Fotos, Geschichten und Abenteuer aus dem Land der aufgehenden Sonne —
            für alle die dabei sein wollen.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/posts"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 glow-cyan"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}
            >
              Alle Posts <ArrowRight size={15} />
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 glass"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              <MapPin size={15} /> Karte öffnen
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 flex flex-col gap-12 pb-20">
        <StatsBar />

        {/* Map preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Meine Route 🗾</h2>
            <Link href="/map" className="text-sm flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "var(--text-secondary)" }}>
              Vollbild <ArrowRight size={13} />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <MiniMap
              markers={POSTS.map(p => ({ lat: p.lat, lng: p.lng, label: p.location, slug: p.slug }))}
              height="320px"
            />
          </div>
        </section>

        {/* Latest posts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Neueste Posts</h2>
            <Link href="/posts" className="text-sm flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "var(--text-secondary)" }}>
              Alle ansehen <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPosts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        </section>

        {/* Next destinations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Als nächstes geplant 📍</h2>
            <Link href="/bucket-list" className="text-sm flex items-center gap-1 transition-colors hover:text-cyan-300" style={{ color: "var(--text-secondary)" }}>
              Alles zeigen <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {nextDestinations.map(item => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: "var(--accent-cyan)" }} />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                <span className="text-xs" style={{ color: "var(--accent-cyan)" }}>{item.location}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section className="text-center py-6">
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            Gefällt dir was du siehst? Du kannst meine Reise unterstützen ☕
          </p>
          <BuyMeCoffee />
        </section>
      </div>
    </div>
  );
}
