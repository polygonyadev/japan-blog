"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import MiniMap from "@/components/MiniMap";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Photo { url?: string; caption?: string }
interface LabPost {
  _id: string;
  title: string;
  slug?: string;
  date?: string;
  location?: string;
  lat?: number;
  lng?: number;
  season?: string;
  weather?: string;
  excerpt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  youtubeId?: string;
  photos?: Photo[];
}

// ─── Demo data (falls noch keine echten Posts da sind) ────────────────────────
const DEMO: LabPost[] = [
  { _id: "d1", title: "Shinjuku bei Nacht", date: "2026-06-20", location: "Tōkyō, Shinjuku", lat: 35.6938, lng: 139.7034, season: "summer",
    excerpt: "Die Lichter, der Lärm, die Energie — Shinjuku ist überwältigend. Ich stehe mitten im Cyberpunk-Traum.", photos: [{}, {}, {}] },
  { _id: "d2", title: "Ramen-Entdeckung", date: "2026-06-22", location: "Tōkyō, Shibuya", lat: 35.6595, lng: 139.7005, season: "summer",
    excerpt: "Eine winzige Bar mit 6 Plätzen. Der beste Tonkotsu meines Lebens. Kein Schild, nur ein roter Vorhang.", photos: [{}, {}], youtubeId: "dQw4w9WgXcQ" },
  { _id: "d3", title: "Tempel am Morgen", date: "2026-06-25", location: "Tōkyō, Asakusa", lat: 35.7148, lng: 139.7967, season: "summer",
    excerpt: "Um 6 Uhr ist der Sensō-ji fast leer. Räucherstäbchen-Duft, Glockenschläge, Stille mitten in der Megacity.", photos: [{}, {}, {}, {}] },
  { _id: "d4", title: "Konbini-Schätze", date: "2026-06-26", location: "Tōkyō", lat: 35.6762, lng: 139.6503, season: "summer",
    excerpt: "Onigiri, Matcha-KitKat, kalter Kaffee aus der Dose. Der 7-Eleven ist mein zweites Zuhause geworden.", photos: [{}] },
];

const SEASON_EMOJI: Record<string, string> = { spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" };

// ─── Window position type ─────────────────────────────────────────────────────
interface Win { id: string; x: number; y: number; z: number; }

export default function NipponOS({ posts }: { posts: LabPost[] }) {
  const data = posts.length >= 3 ? posts : [...posts, ...DEMO];
  const [booted, setBooted] = useState(false);
  const [clock, setClock] = useState("");
  const [wins, setWins] = useState<Win[]>([]);
  const zCounter = useRef(10);
  const drag = useRef<{ id: string; offX: number; offY: number } | null>(null);

  // Boot splash
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1400);
    return () => clearTimeout(t);
  }, []);

  // Tokyo clock
  useEffect(() => {
    function tick() {
      const tokyo = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      setClock(tokyo.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
    }
    tick();
    const i = setInterval(tick, 1000 * 20);
    return () => clearInterval(i);
  }, []);

  const openWindow = useCallback((id: string) => {
    setWins(prev => {
      const exists = prev.find(w => w.id === id);
      zCounter.current += 1;
      if (exists) return prev.map(w => w.id === id ? { ...w, z: zCounter.current } : w);
      const offset = prev.length * 28;
      const startX = typeof window !== "undefined" ? Math.max(20, Math.min(window.innerWidth / 2 - 320, 120)) + offset : 120;
      return [...prev, { id, x: startX, y: 90 + offset, z: zCounter.current }];
    });
  }, []);

  const closeWindow = (id: string) => setWins(prev => prev.filter(w => w.id !== id));
  const focusWindow = (id: string) => setWins(prev => {
    zCounter.current += 1;
    return prev.map(w => w.id === id ? { ...w, z: zCounter.current } : w);
  });

  // Drag handlers
  function onTitlePointerDown(e: React.PointerEvent, id: string) {
    const win = wins.find(w => w.id === id);
    if (!win) return;
    focusWindow(id);
    drag.current = { id, offX: e.clientX - win.x, offY: e.clientY - win.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const { id, offX, offY } = drag.current;
    setWins(prev => prev.map(w => w.id === id ? { ...w, x: e.clientX - offX, y: Math.max(60, e.clientY - offY) } : w));
  }
  function onPointerUp() { drag.current = null; }

  // ─── Boot splash ──
  if (!booted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(160deg, #1a1040, #2d1b5e 45%, #c8447a)" }}>
        <div className="text-6xl mb-6 animate-pulse">🗾</div>
        <div className="text-white font-bold text-2xl tracking-widest mb-1" style={{ fontFamily: "monospace" }}>NipponOS</div>
        <div className="text-white/50 text-xs mb-8 tracking-wider">v0.1 — Lab</div>
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div className="h-full rounded-full" style={{ background: "#fff", animation: "bootbar 1.3s ease-out forwards" }} />
        </div>
        <style>{`@keyframes bootbar{from{width:0}to{width:100%}}`}</style>
      </div>
    );
  }

  // ─── Desktop ──
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none"
      onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      style={{
        background: "linear-gradient(160deg, #1a1040 0%, #2d1b5e 45%, #6d3b8e 80%, #c8447a 100%)",
      }}>
      {/* Wallpaper deko: großes Kanji + Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <span className="absolute -right-10 top-10 text-[28rem] font-bold leading-none" style={{ color: "rgba(255,255,255,0.04)" }}>旅</span>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* ─── Top Menu Bar ─── */}
      <div className="absolute top-0 left-0 right-0 h-9 flex items-center justify-between px-4 z-20"
        style={{ background: "rgba(20,12,40,0.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-3 text-white text-sm">
          <span className="font-bold">🗾 NipponOS</span>
          <span className="text-white/50 hidden sm:inline">Datei</span>
          <span className="text-white/50 hidden sm:inline">Ansicht</span>
        </div>
        <div className="flex items-center gap-3 text-white text-sm">
          <Link href="/" className="text-white/60 hover:text-white transition-colors text-xs">← zurück zur Website</Link>
          <span className="font-mono tabular-nums">🇯🇵 {clock}</span>
        </div>
      </div>

      {/* ─── Desktop Icons ─── */}
      <div className="absolute top-14 left-4 right-4 bottom-4 z-10">
        <div className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, 96px)", gridAutoRows: "108px" }}>
          {data.map(post => (
            <button key={post._id} onDoubleClick={() => openWindow(post._id)} onClick={(e) => { if (e.detail === 1 && window.matchMedia("(max-width: 768px)").matches) openWindow(post._id); }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:bg-white/10 group"
              title="Doppelklick zum Öffnen">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-hover:-rotate-2"
                style={{ background: post.photos?.[0]?.url ? "transparent" : "linear-gradient(135deg, #ff2d6b, #00d4ff)", boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>
                {post.photos?.[0]?.url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={post.photos[0].url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-3xl">{SEASON_EMOJI[post.season ?? ""] ?? "📁"}</span>}
              </div>
              <span className="text-white text-xs text-center leading-tight line-clamp-2 px-0.5"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{post.title}</span>
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs mt-4">💡 Doppelklick auf ein Icon (am Handy: einfach tippen)</p>
      </div>

      {/* ─── Windows ─── */}
      {wins.map(win => {
        const post = data.find(p => p._id === win.id);
        if (!post) return null;
        return (
          <Window key={win.id} post={post} win={win}
            onClose={() => closeWindow(win.id)}
            onFocus={() => focusWindow(win.id)}
            onTitleDown={(e) => onTitlePointerDown(e, win.id)} />
        );
      })}

      {/* ─── Taskbar (offene Fenster) ─── */}
      {wins.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-11 flex items-center gap-2 px-3 z-30"
          style={{ background: "rgba(20,12,40,0.7)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {wins.map(w => {
            const p = data.find(x => x._id === w.id);
            return (
              <button key={w.id} onClick={() => focusWindow(w.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs transition-all hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.08)", maxWidth: 160 }}>
                <span className="truncate">{p?.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Window component ─────────────────────────────────────────────────────────
function Window({ post, win, onClose, onFocus, onTitleDown }: {
  post: LabPost; win: Win; onClose: () => void; onFocus: () => void; onTitleDown: (e: React.PointerEvent) => void;
}) {
  const photos = (post.photos ?? []).filter(p => p.url);
  const rest = photos.slice(1);

  return (
    <div
      className="absolute rounded-2xl overflow-hidden flex flex-col"
      onPointerDown={onFocus}
      style={{
        left: win.x, top: win.y, zIndex: win.z,
        width: "min(92vw, 640px)", maxHeight: "82vh",
        background: "var(--bg-secondary)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        animation: "winopen 0.22s cubic-bezier(0.2,0.9,0.3,1.3)",
      }}>
      <style>{`@keyframes winopen{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Title bar */}
      <div onPointerDown={onTitleDown}
        className="flex items-center gap-2 px-3 h-9 flex-shrink-0 cursor-grab active:cursor-grabbing"
        style={{ background: "linear-gradient(90deg, #ff2d6b, #c8447a)" }}>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform hover:scale-125"
          style={{ background: "#ff5f57", border: "1px solid rgba(0,0,0,0.2)" }} title="Schließen" />
        <span className="w-3.5 h-3.5 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3.5 h-3.5 rounded-full" style={{ background: "#28c840" }} />
        <span className="text-white text-sm font-medium ml-2 truncate">{post.title}</span>
      </div>

      {/* Body */}
      <div className="overflow-y-auto p-5" style={{ color: "var(--text-primary)" }}>
        {/* Cover */}
        {photos[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[0].url} alt={post.title} className="w-full h-48 object-cover rounded-xl mb-4" />
        ) : (
          <div className="w-full h-40 rounded-xl mb-4 flex items-center justify-center text-5xl"
            style={{ background: "linear-gradient(135deg, #ff2d6b, #00d4ff)" }}>
            {SEASON_EMOJI[post.season ?? ""] ?? "🗾"}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          {post.date && <span>📅 {new Date(post.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</span>}
          {post.location && <span>📍 {post.location}</span>}
          {post.season && <span>{SEASON_EMOJI[post.season]}</span>}
        </div>

        {/* Text */}
        <div className="text-sm leading-relaxed mb-4">
          {post.content ? <PortableText value={post.content} /> : <p style={{ color: "var(--text-secondary)" }}>{post.excerpt}</p>}
        </div>

        {/* Weitere Fotos */}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {rest.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p.url} alt={p.caption ?? ""} className="w-full h-28 object-cover rounded-lg" />
            ))}
          </div>
        )}

        {/* Map */}
        {post.lat && post.lng && (
          <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)" }}>
            <MiniMap markers={[{ lat: post.lat, lng: post.lng, label: post.location ?? post.title }]} height="180px" zoom={11} />
          </div>
        )}

        {/* YouTube */}
        {post.youtubeId && (
          <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${post.youtubeId}`}
              title="YouTube" allowFullScreen />
          </div>
        )}
      </div>
    </div>
  );
}
