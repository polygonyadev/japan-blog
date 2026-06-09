"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LabPost {
  _id: string;
  title: string;
  slug?: string;
  date?: string;
  location?: string;
  excerpt?: string;
  tags?: string[];
  cover?: string;
}

// ─── Tokyo Metro Linienfarben ────────────────────────────────────────────────
const NAVY = "#152c5b";
const NAVY_DARK = "#0f2147";

const NAV = [
  { label: "HOME",     line: "Ginza Orange",   color: "#f39700" },
  { label: "STORIES",  line: "Marunouchi Red", color: "#e60012" },
  { label: "GUIDES",   line: "Hibiya Grey",    color: "#9a9a9a" },
  { label: "CULTURE",  line: "Tōzai Blue",     color: "#00a7db" },
  { label: "NEWS",     line: "Chiyoda Green",  color: "#00bb85" },
];

const FOLDERS = [
  { num: 1, code: "G", color: "#f39700", title: "STADTVIERTEL", items: ["Ginza", "Shinjuku", "Shibuya"], tag: "Shibuya" },
  { num: 2, code: "M", color: "#e60012", title: "ZUGLINIEN",    items: ["Stationen", "Karten", "Tipps"],  tag: "Karten" },
  { num: 3, code: "H", color: "#9a9a9a", title: "KULTUR",       items: ["Essen", "Kunst", "Geschichte"],  tag: "Kunst" },
  { num: 4, code: "T", color: "#00a7db", title: "TIPPS",        items: ["Pendeln", "Tickets", "Etikette"], tag: "Tickets" },
];

const LINE_BADGES = [
  { code: "G", color: "#f39700" }, { code: "M", color: "#e60012" }, { code: "H", color: "#9a9a9a" },
  { code: "T", color: "#00a7db" }, { code: "C", color: "#00bb85" }, { code: "Y", color: "#c1a470" },
];

const DEMO: LabPost[] = [
  { _id: "d1", title: "Versteckte Izakayas beim Bahnhof Shinjuku", location: "Shinjuku", excerpt: "Winzige Bars in den Gassen unter den Gleisen." },
  { _id: "d2", title: "Yanaka: ein Spaziergang durchs alte Tokyo", location: "Yanaka", excerpt: "Retro-Viertel mit Katzen, Tempeln und Handwerk." },
  { _id: "d3", title: "U-Bahn-Etikette für Reisende", location: "Tōkyō", excerpt: "Die ungeschriebenen Regeln der Metro." },
  { _id: "d4", title: "Konbini-Schätze um Mitternacht", location: "Shibuya", excerpt: "Was man im 7-Eleven unbedingt probieren muss." },
  { _id: "d5", title: "Morgens am Sensō-ji", location: "Asakusa", excerpt: "Der Tempel bevor die Touristen kommen." },
  { _id: "d6", title: "Ramen ohne Schild", location: "Nakano", excerpt: "Der beste Tonkotsu hinter einem roten Vorhang." },
];

// ─── Subway-Map SVG (Deko) ────────────────────────────────────────────────────
function SubwayMap({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 260" className={className} style={style} fill="none">
      <path d="M20 30 L20 140 L90 210 L90 250" stroke="#f39700" strokeWidth="4" />
      <path d="M0 80 L70 80 L130 140 L200 140" stroke="#e60012" strokeWidth="4" />
      <path d="M40 0 L40 90 L110 160 L110 260" stroke="#00a7db" strokeWidth="4" />
      <path d="M0 180 L80 180 L150 110 L200 110" stroke="#00bb85" strokeWidth="4" />
      <path d="M160 0 L160 120 L100 180 L100 260" stroke="#c1a470" strokeWidth="4" />
      {[[20,30],[70,80],[90,210],[130,140],[110,160],[80,180],[160,120],[40,90]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke={NAVY} strokeWidth="2.5" />
      ))}
    </svg>
  );
}

function MetroLogo({ size = 28 }: { size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size, height: size, background: NAVY, color: "#fff", fontSize: size * 0.5 }}>
      日
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MetroPortal({ posts }: { posts: LabPost[] }) {
  const discoveries = posts.length >= 3 ? posts : [...posts, ...DEMO];
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#eef1f6", fontFamily: "system-ui, sans-serif" }}>
      {/* dünne Linien-Deko oben */}
      <div className="h-1.5 flex">
        {NAV.map(n => <div key={n.label} className="flex-1" style={{ background: n.color }} />)}
      </div>

      {/* ─── Header ─── */}
      <header className="bg-white px-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderBottom: `3px solid ${NAVY}` }}>
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded flex items-center gap-1.5" style={{ background: NAVY }}>
            <MetroLogo size={22} />
            <span className="text-white text-[10px] font-bold leading-tight">東京<br/>メトロ</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            NIPPON DIARY <span style={{ color: "#e60012" }}>METRO</span>
          </h1>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold" style={{ color: NAVY }}>東京メトロ</div>
          <div className="text-xs" style={{ color: "#888" }}>Tokyo Stories</div>
        </div>
      </header>

      {/* ─── Subway-Line Nav ─── */}
      <nav className="flex items-stretch overflow-x-auto" style={{ background: NAVY }}>
        {NAV.map((n, i) => (
          <button key={n.label} onClick={() => setActiveNav(i)}
            className="px-4 sm:px-6 py-2 flex flex-col items-center justify-center transition-all flex-shrink-0"
            style={{ background: activeNav === i ? n.color : "transparent", minWidth: 110 }}>
            <span className="text-white font-bold text-sm">{n.label}</span>
            <span className="text-white/80 text-[10px]">{n.line}</span>
          </button>
        ))}
        <Link href="/" className="px-4 sm:px-6 py-2 flex items-center text-white/70 hover:text-white text-sm flex-shrink-0 ml-auto">
          ← Website
        </Link>
      </nav>

      {/* ─── Body: 3 Spalten ─── */}
      <div className="max-w-7xl mx-auto flex gap-4 p-4">
        {/* Linke Sidebar: Station-Sign + Map */}
        <aside className="hidden lg:flex flex-col gap-4 w-44 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2" style={{ border: `2px solid ${NAVY}` }}>
            <MetroLogo size={32} />
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: NAVY }}>日本橋</div>
              <div className="text-[10px] tracking-widest" style={{ color: "#888" }}>NIHONBASHI</div>
            </div>
            <div className="flex gap-1 mt-1">
              <span className="text-xs">◀</span><span className="text-xs">▶</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 flex-1" style={{ border: `1px solid #d5dae6` }}>
            <SubwayMap className="w-full" />
          </div>
        </aside>

        {/* Mitte: Folders + Discoveries */}
        <main className="flex-1 min-w-0">
          {/* Folder-Tab */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-lg text-white text-sm font-medium" style={{ background: NAVY }}>
            📁 Folder
          </div>

          <div className="bg-white rounded-b-2xl rounded-tr-2xl p-5" style={{ border: `1px solid #d5dae6` }}>
            {/* EXPLORE */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black tracking-tight" style={{ color: "#1a1a1a" }}>STADTVIERTEL & THEMEN</h2>
              <div className="flex gap-1">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{ background: NAVY }}>‹</span>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{ background: NAVY }}>›</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {FOLDERS.map(f => (
                <div key={f.num} className="rounded-xl overflow-hidden flex flex-col" style={{ border: `1px solid #e0e4ee`, background: "#fafbfd" }}>
                  {/* Tab */}
                  <div className="h-7 flex items-center px-2 gap-1.5" style={{ background: f.color }}>
                    <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold" style={{ color: f.color }}>{f.code}</span>
                  </div>
                  {/* Body */}
                  <div className="p-3 flex-1">
                    <div className="font-black text-sm mb-1" style={{ color: "#1a1a1a" }}>{f.num}. {f.title}</div>
                    <div className="h-0.5 w-8 mb-2" style={{ background: f.color }} />
                    <ul className="text-xs space-y-0.5" style={{ color: "#555" }}>
                      {f.items.map(it => <li key={it}>• {it}</li>)}
                    </ul>
                  </div>
                  {/* Bottom bar */}
                  <div className="flex items-center justify-between px-2 py-1.5" style={{ background: `${f.color}22` }}>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: f.color, color: "#fff" }}>Aktiv</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: f.color }}>{f.tag} ›</span>
                  </div>
                </div>
              ))}
            </div>

            {/* RECENT DISCOVERIES */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black tracking-tight" style={{ color: "#1a1a1a" }}>NEUESTE ENTDECKUNGEN</h2>
              <div className="flex gap-1">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{ background: NAVY }}>‹</span>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs" style={{ background: NAVY }}>›</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {discoveries.map((post, i) => {
                const badge = LINE_BADGES[i % LINE_BADGES.length];
                const code = `${badge.code}${String((i % 20) + 1).padStart(2, "0")}`;
                return (
                  <div key={post._id} className="rounded-xl overflow-hidden relative group cursor-pointer" style={{ border: `1px solid #e0e4ee` }}>
                    <div className="h-36 relative overflow-hidden">
                      {post.cover
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={post.cover} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${badge.color}, ${NAVY})` }}>
                            <span className="text-4xl opacity-40">🚉</span>
                          </div>}
                      {/* Station-Code Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-white text-xs font-bold flex items-center gap-1"
                        style={{ background: badge.color, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
                        {code}
                      </span>
                      {/* Titel-Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-2.5" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
                        <p className="text-white text-sm font-bold leading-tight">{post.title}</p>
                        {post.location && <p className="text-white/70 text-xs mt-0.5">📍 {post.location}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Rechte Sidebar */}
        <aside className="hidden xl:flex flex-col gap-4 w-52 flex-shrink-0">
          {/* Staff Picks */}
          <div className="bg-white rounded-2xl p-4" style={{ border: `1px solid #d5dae6` }}>
            <h3 className="font-black text-sm mb-3" style={{ color: NAVY }}>EMPFEHLUNGEN</h3>
            <ul className="space-y-2">
              {[["G","Ginza","#f39700"],["M","Marunouchi","#e60012"],["H","Kultur","#9a9a9a"],["T","Tipps","#00a7db"]].map(([c,l,col])=>(
                <li key={l as string} className="flex items-center gap-2 text-sm" style={{ color: "#444" }}>
                  <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: col as string }}>{c}</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
          {/* Popular Lines */}
          <div className="bg-white rounded-2xl p-4" style={{ border: `1px solid #d5dae6` }}>
            <h3 className="font-black text-sm mb-3" style={{ color: NAVY }}>BELIEBTE LINIEN</h3>
            <div className="rounded-lg p-2" style={{ background: "#f4f6fa" }}>
              <SubwayMap className="w-full" style={{ height: 120 }} />
            </div>
          </div>
          {/* Search */}
          <div className="bg-white rounded-2xl p-4" style={{ border: `1px solid #d5dae6` }}>
            <h3 className="font-black text-sm mb-2" style={{ color: NAVY }}>SUCHE</h3>
            <div className="flex gap-1">
              <input placeholder="Suchen..." className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none" style={{ border: "1px solid #d5dae6" }} />
              <button className="px-3 rounded-lg text-white text-sm" style={{ background: NAVY }}>🔍</button>
            </div>
          </div>
        </aside>
      </div>

      {/* ─── Footer ─── */}
      <footer className="px-6 py-5 flex items-center justify-between mt-4" style={{ background: NAVY_DARK }}>
        <div className="flex items-center gap-2">
          <MetroLogo size={22} />
          <span className="text-white text-sm font-bold">NIPPON DIARY METRO</span>
          <span className="text-white/40 text-xs">© 2026</span>
        </div>
        <div className="flex gap-3 text-white/70 text-sm">
          <span>📷</span><span>▶</span><span>𝕏</span>
        </div>
      </footer>
    </div>
  );
}
