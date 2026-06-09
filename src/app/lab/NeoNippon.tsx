"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LabPost {
  _id: string; title: string; slug?: string; date?: string;
  location?: string; excerpt?: string; tags?: string[]; cover?: string;
}

// ─── Farben ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#1a1a2e",
  bg2: "#16213e",
  cream: "#fdfaf6",
  pink: "#ff2a6d",
  cyan: "#3df0e0",
  ochre: "#e8a13a",
  ink: "#2a2a3a",
};

const DEMO: LabPost[] = [
  { _id: "d1", title: "Shinjuku bei Nacht ✨", location: "Tōkyō, Shinjuku", date: "2026-06-20", excerpt: "Neon überall. Ich stehe mitten im Cyberpunk-Traum und kann nicht aufhören zu staunen. Die Stadt schläft nie." },
  { _id: "d2", title: "Ramen ohne Schild 🍜", location: "Nakano", date: "2026-06-22", excerpt: "Sechs Plätze, ein roter Vorhang, kein Name. Der beste Tonkotsu meines Lebens — gefunden durch reines Glück." },
  { _id: "d3", title: "Morgens am Tempel ⛩️", location: "Asakusa", date: "2026-06-25", excerpt: "Um 6 Uhr ist der Sensō-ji fast leer. Räucherstäbchen, Glocken, Stille mitten in der Megacity." },
  { _id: "d4", title: "Konbini-Schätze 🏪", location: "Shibuya", date: "2026-06-26", excerpt: "Onigiri, Matcha-KitKat, Dosenkaffee. Der 7-Eleven ist mein zweites Zuhause geworden." },
];

function beep() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "square"; o.frequency.value = 660;
    g.gain.value = 0.04;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.stop(ctx.currentTime + 0.12);
  } catch {}
}

export default function NeoNippon({ posts }: { posts: LabPost[] }) {
  const data = posts.length >= 2 ? posts : [...posts, ...DEMO];
  const [visitors, setVisitors] = useState(1337);
  const [blink, setBlink] = useState(true);
  const sound = useRef(true);

  useEffect(() => {
    const n = 1337 + Math.floor((Date.now() / 86400000) % 500);
    setVisitors(n);
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  const click = () => { if (sound.current) beep(); };

  // ── Retro bevel (raised) ──
  const raised: React.CSSProperties = { boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.5), inset -2px -2px 0 rgba(0,0,0,0.35)" };
  const sunken: React.CSSProperties = { boxShadow: "inset -2px -2px 0 rgba(255,255,255,0.4), inset 2px 2px 0 rgba(0,0,0,0.35)" };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: C.bg, color: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        .pixel { font-family: 'Press Start 2P', monospace; }
        .term  { font-family: 'VT323', monospace; }
        @keyframes neo-marquee { from { transform: translateX(100%);} to { transform: translateX(-100%);} }
        @keyframes neo-wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-1.5deg)} 75%{transform:rotate(1.5deg)} }
        @keyframes neo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .neo-win { transition: transform .15s; }
        .neo-win:hover { transform: translateY(-3px); }
        .neo-link { color: ${C.pink}; text-decoration: none; }
        .neo-link:hover { text-shadow: 0 0 8px ${C.pink}; text-decoration: underline; }
        .neo-btn:hover { animation: neo-wiggle .3s; }
      `}</style>

      {/* Hintergrund-Deko: Grid + Sterne */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden style={{
        backgroundImage: `linear-gradient(${C.cyan}11 1px, transparent 1px), linear-gradient(90deg, ${C.cyan}11 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <span className="absolute right-6 top-24 text-7xl opacity-20" style={{ animation: "neo-float 6s ease-in-out infinite" }}>🌙</span>
        <span className="absolute left-8 bottom-32 text-4xl opacity-20" style={{ animation: "neo-float 5s ease-in-out infinite" }}>✨</span>
        <span className="text-[22rem] font-bold absolute -right-16 bottom-0 leading-none" style={{ color: "rgba(255,42,109,0.04)" }}>日</span>
      </div>

      {/* ─── Marquee oben ─── */}
      <div className="relative overflow-hidden py-1.5" style={{ background: C.pink, borderBottom: `3px solid ${C.ink}` }}>
        <div className="term text-lg whitespace-nowrap" style={{ color: C.bg, animation: "neo-marquee 18s linear infinite" }}>
          ★ ようこそ！ Willkommen in meiner Ecke des Internets ★ Ein Jahr Japan, Foto für Foto ★ Best viewed with curiosity ★ 日本大好き ★
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6">
        {/* ─── Header ─── */}
        <header className="text-center mb-6">
          <h1 className="pixel text-2xl sm:text-4xl mb-3" style={{ color: C.cream, textShadow: `3px 3px 0 ${C.pink}, 6px 6px 0 ${C.ink}` }}>
            NIPPON<span style={{ color: C.cyan }}>OS</span>
          </h1>
          <p className="term text-2xl" style={{ color: C.ochre }}>
            日記.exe — ein Reisetagebuch{" "}
            <span style={{ opacity: blink ? 1 : 0, color: C.cyan }}>▮</span>
          </p>
        </header>

        {/* ─── Zwei Spalten ─── */}
        <div className="flex flex-col md:flex-row gap-5">

          {/* ── Sidebar ── */}
          <aside className="md:w-52 flex-shrink-0 flex flex-col gap-4">
            {/* Profil */}
            <div className="p-1" style={{ background: C.cyan, ...raised }}>
              <div className="p-3 text-center" style={{ background: C.cream, color: C.ink }}>
                <div className="text-5xl mb-1" style={{ animation: "neo-float 4s ease-in-out infinite" }}>🗾</div>
                <div className="pixel text-[10px] mb-1" style={{ color: C.pink }}>~ DAVID ~</div>
                <div className="term text-lg leading-tight">In Japan unterwegs.<br/>Foto-Sammler.<br/>Ramen-Jäger.</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-1" style={{ background: C.ochre, ...raised }}>
              <div className="p-2" style={{ background: C.bg2 }}>
                <div className="pixel text-[9px] mb-2 text-center" style={{ color: C.ochre }}>● MENU ●</div>
                {["★ Home", "✎ Blog", "📷 Fotos", "🗺 Karte", "✉ Gästebuch"].map(item => (
                  <button key={item} onClick={click}
                    className="neo-btn term text-xl w-full text-left px-2 py-0.5 mb-1"
                    style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.04)" }}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Besucherzähler */}
            <div className="p-1 text-center" style={{ background: C.ink, ...raised }}>
              <div className="term text-base py-2" style={{ color: C.cyan }}>
                <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>VISITORS</div>
                <span className="px-2 py-0.5 text-xl tracking-widest" style={{ background: "#000", color: "#33ff66", letterSpacing: "3px" }}>
                  {String(visitors).padStart(6, "0")}
                </span>
              </div>
            </div>

            {/* Now Playing */}
            <div className="p-2 term text-lg text-center" style={{ background: C.bg2, ...sunken, color: C.ochre }}>
              ♪ now playing ♪<br/>
              <span style={{ color: C.pink }}>City Pop Mix '84</span>
            </div>

            {/* 88x31 buttons */}
            <div className="flex flex-wrap gap-1 justify-center">
              {[["日本",C.pink],["WEB",C.cyan],["88×31",C.ochre],["★",C.cream]].map(([t,col],i)=>(
                <div key={i} className="term text-xs flex items-center justify-center"
                  style={{ width: 88, height: 31, background: C.bg2, border: `2px solid ${col as string}`, color: col as string }}>
                  {t}
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main: Posts als Retro-Fenster ── */}
          <main className="flex-1 min-w-0 flex flex-col gap-5">
            <div className="pixel text-xs mb-1" style={{ color: C.cyan }}>&gt;&gt; NEUESTE EINTRÄGE_</div>

            {data.map((post, i) => (
              <article key={post._id} className="neo-win p-1" style={{ background: i % 2 ? C.cyan : C.pink, ...raised }}>
                {/* Titelleiste */}
                <div className="flex items-center justify-between px-2 py-1" style={{ background: C.ink }}>
                  <span className="term text-lg truncate" style={{ color: C.cream }}>▓ {post.title}</span>
                  <span className="flex gap-1 flex-shrink-0">
                    {["_","□","✕"].map(s => (
                      <span key={s} className="term text-sm w-4 h-4 flex items-center justify-center" style={{ background: C.cream, color: C.ink }}>{s}</span>
                    ))}
                  </span>
                </div>
                {/* Inhalt */}
                <div className="p-3 flex flex-col sm:flex-row gap-3" style={{ background: C.cream, color: C.ink }}>
                  {/* Foto */}
                  <div className="sm:w-40 flex-shrink-0">
                    <div className="p-1" style={{ background: C.bg, ...sunken }}>
                      {post.cover
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={post.cover} alt={post.title} className="w-full h-28 object-cover" style={{ imageRendering: "auto" }} />
                        : <div className="w-full h-28 flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${C.pink}, ${C.cyan})` }}>📷</div>}
                    </div>
                    <div className="term text-center text-sm mt-1" style={{ color: C.pink }}>
                      📍 {post.location ?? "Japan"}
                    </div>
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="term text-base mb-1" style={{ color: C.ochre }}>
                      {post.date ? new Date(post.date).toLocaleDateString("de-DE", { day:"numeric", month:"long", year:"numeric" }) : ""}
                    </div>
                    <p className="text-sm leading-relaxed mb-2">{post.excerpt}</p>
                    <button onClick={click} className="neo-btn term text-lg neo-link">» weiterlesen «</button>
                  </div>
                </div>
              </article>
            ))}

            {/* Gästebuch-Teaser */}
            <div className="p-1" style={{ background: C.ochre, ...raised }}>
              <div className="p-4 text-center" style={{ background: C.bg2 }}>
                <div className="pixel text-xs mb-2" style={{ color: C.ochre }}>✉ GÄSTEBUCH ✉</div>
                <p className="term text-xl mb-3" style={{ color: C.cream }}>Hinterlass mir eine Nachricht aus der Heimat! (-‿‿-)</p>
                <button onClick={click} className="neo-btn pixel text-[10px] px-4 py-3" style={{ background: C.pink, color: C.cream, ...raised }}>
                  ★ EINTRAGEN ★
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* ─── Footer ─── */}
        <footer className="mt-8 text-center term text-lg" style={{ color: C.cyan }}>
          <div className="mb-1">·｡°✩ Best viewed in 1024×768 ✩°｡·</div>
          <div style={{ color: C.ochre }}>🚧 under eternal construction 🚧</div>
          <div className="mt-2" style={{ color: C.cream, opacity: 0.6 }}>
            © 2026 NipponOS · <Link href="/" className="neo-link">zurück zur echten Website</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
