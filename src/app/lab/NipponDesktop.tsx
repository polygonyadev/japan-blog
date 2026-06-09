"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MiniMap from "@/components/MiniMap";

interface Photo { url?: string; caption?: string }
interface LabPost {
  _id: string; title: string; slug?: string; date?: string; location?: string;
  lat?: number; lng?: number; excerpt?: string; tags?: string[]; youtubeId?: string;
  cover?: string; photos?: Photo[];
}

const C = { bg: "#1a1a2e", bg2: "#16213e", cream: "#fdfaf6", pink: "#ff2a6d", cyan: "#3df0e0", ochre: "#e8a13a", ink: "#2a2a3a" };
const raised: React.CSSProperties = { boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.5), inset -2px -2px 0 rgba(0,0,0,0.4)" };
const sunken: React.CSSProperties = { boxShadow: "inset -2px -2px 0 rgba(255,255,255,0.4), inset 2px 2px 0 rgba(0,0,0,0.4)" };

const DEMO: LabPost[] = [
  { _id: "d1", title: "Shinjuku bei Nacht ✨", location: "Tōkyō, Shinjuku", lat: 35.6938, lng: 139.7034, date: "2026-06-20", tags: ["Neon", "Nacht"], excerpt: "Neon überall. Ich stehe mitten im Cyberpunk-Traum und kann nicht aufhören zu staunen.", photos: [{}, {}] },
  { _id: "d2", title: "Ramen ohne Schild 🍜", location: "Nakano", lat: 35.7056, lng: 139.6657, date: "2026-06-22", tags: ["Essen"], excerpt: "Sechs Plätze, ein roter Vorhang, kein Name. Der beste Tonkotsu meines Lebens.", photos: [{}], youtubeId: "jfKfPfyJRdk" },
  { _id: "d3", title: "Morgens am Tempel ⛩️", location: "Asakusa", lat: 35.7148, lng: 139.7967, date: "2026-06-25", tags: ["Kultur"], excerpt: "Um 6 Uhr ist der Sensō-ji fast leer. Räucherstäbchen, Glocken, Stille.", photos: [{}, {}, {}] },
  { _id: "d4", title: "Konbini-Schätze 🏪", location: "Shibuya", lat: 35.6595, lng: 139.7005, date: "2026-06-26", tags: ["Essen", "Alltag"], excerpt: "Onigiri, Matcha-KitKat, Dosenkaffee. Der 7-Eleven ist mein zweites Zuhause.", photos: [{}] },
];

function beep(freq = 660) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext); if (!Ctx) return;
    const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "square"; o.frequency.value = freq; g.gain.value = 0.04;
    o.connect(g); g.connect(ctx.destination); o.start();
    o.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12); o.stop(ctx.currentTime + 0.12);
  } catch {}
}

const APPS = [
  { id: "blog", icon: "✎", title: "Blog.exe" },
  { id: "photo", icon: "📷", title: "Foto des Tages" },
  { id: "video", icon: "▶", title: "Video des Tages" },
  { id: "map", icon: "🗺", title: "Karte" },
  { id: "paint", icon: "🎨", title: "Paint" },
  { id: "snake", icon: "🐍", title: "Snake" },
  { id: "about", icon: "★", title: "Über mich" },
  { id: "guestbook", icon: "✉", title: "Gästebuch" },
];
const DESKTOP_ICONS = ["blog", "photo", "map", "paint", "snake", "guestbook"];
const W: Record<string, number> = { blog: 560, video: 560, map: 520, paint: 520, snake: 340, about: 440, guestbook: 460, photo: 440 };
function appWidth(id: string) { return id.startsWith("post:") ? 540 : (W[id] ?? 460); }
function winMeta(id: string, data: LabPost[]) {
  if (id.startsWith("post:")) { const p = data.find(x => x._id === id.slice(5)); return { icon: "📄", title: p?.title ?? "Post" }; }
  const a = APPS.find(x => x.id === id); return { icon: a?.icon ?? "▢", title: a?.title ?? id };
}

interface OpenWin { id: string; x: number; y: number; z: number; min?: boolean; max?: boolean }

export default function NipponDesktop({ posts }: { posts: LabPost[] }) {
  const data = posts.length >= 2 ? posts : [...posts, ...DEMO];
  const [booted, setBooted] = useState(false);
  const [shutting, setShutting] = useState(false);
  const [wins, setWins] = useState<OpenWin[]>([]);
  const [clock, setClock] = useState("");
  const [visitors, setVisitors] = useState(1337);
  const [sound, setSound] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const z = useRef(10);
  const drag = useRef<{ id: string; sx: number; sy: number; wx: number; wy: number } | null>(null);
  const soundRef = useRef(true); soundRef.current = sound;
  const click = (f = 660) => { if (soundRef.current) beep(f); };
  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 760;

  // Cat follows mouse
  const catRef = useRef<HTMLButtonElement>(null);
  const mouse = useRef({ x: 400, y: 300 });
  const catPos = useRef({ x: 150, y: 150 });

  function boot() {
    setBooted(true); z.current += 3;
    setWins([{ id: "blog", x: 150, y: 28, z: 11, max: isMobile() }, ...(isMobile() ? [] : [{ id: "photo", x: 530, y: 90, z: 12 }])]);
  }
  function shutdown() {
    click(330); setStartOpen(false); setShutting(true);
    setTimeout(() => { setShutting(false); setBooted(false); setWins([]); }, 1100);
  }

  useEffect(() => { const t = setTimeout(() => boot(), 1700); return () => clearTimeout(t); }, []); // eslint-disable-line

  useEffect(() => {
    setVisitors(1337 + Math.floor((Date.now() / 86400000) % 500));
    function tick() { setClock(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })); }
    tick(); const t = setInterval(tick, 20000); return () => clearInterval(t);
  }, []);

  // Cat rAF follow
  useEffect(() => {
    if (!booted) return;
    const onMM = (e: PointerEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("pointermove", onMM);
    let raf = 0;
    const loop = () => {
      const area = document.getElementById("neko-area");
      if (area && catRef.current) {
        const r = area.getBoundingClientRect();
        const tx = mouse.current.x - r.left - 16, ty = mouse.current.y - r.top + 12;
        catPos.current.x += (tx - catPos.current.x) * 0.045;
        catPos.current.y += (ty - catPos.current.y) * 0.045;
        const cx = Math.max(0, Math.min(r.width - 34, catPos.current.x));
        const cy = Math.max(0, Math.min(r.height - 34, catPos.current.y));
        const flip = tx < catPos.current.x ? -1 : 1;
        catRef.current.style.transform = `translate(${cx}px, ${cy}px) scaleX(${flip})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMM); };
  }, [booted]);

  function openApp(id: string) {
    click(); setStartOpen(false);
    setWins(prev => {
      const ex = prev.find(w => w.id === id); z.current += 1;
      if (ex) return prev.map(w => w.id === id ? { ...w, z: z.current, min: false } : w);
      const off = prev.length * 22;
      return [...prev, { id, x: 160 + off, y: 34 + off, z: z.current, max: isMobile() }];
    });
  }
  const openPost = (pid: string) => openApp(`post:${pid}`);
  const closeWin = (id: string) => setWins(p => p.filter(w => w.id !== id));
  const focusWin = (id: string) => setWins(p => { z.current += 1; return p.map(w => w.id === id ? { ...w, z: z.current } : w); });
  const minWin = (id: string) => setWins(p => p.map(w => w.id === id ? { ...w, min: true } : w));
  const maxWin = (id: string) => setWins(p => p.map(w => w.id === id ? { ...w, max: !w.max } : w));
  const taskClick = (id: string) => { click(); z.current += 1; const zz = z.current; setWins(p => p.map(w => w.id === id ? { ...w, min: false, z: zz } : w)); };

  function onTitleDown(e: React.PointerEvent, id: string) {
    const w = wins.find(x => x.id === id); if (!w || w.max) return;
    focusWin(id); drag.current = { id, sx: e.clientX, sy: e.clientY, wx: w.x, wy: w.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return; const d = drag.current;
    setWins(p => p.map(w => w.id === d.id ? { ...w, x: d.wx + (e.clientX - d.sx), y: Math.max(0, d.wy + (e.clientY - d.sy)) } : w));
  }
  const onUp = () => { drag.current = null; };

  // ── Shutdown screen ──
  if (shutting) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: "#000", color: C.cream }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');.pixel{font-family:'Press Start 2P',monospace}.term{font-family:'VT323',monospace}`}</style>
        <div className="pixel text-sm mb-3">NipponOS</div>
        <div className="term text-2xl" style={{ color: C.cyan }}>wird heruntergefahren…</div>
      </div>
    );
  }

  // ── Boot / Login ──
  if (!booted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: C.bg, color: C.cream }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');.pixel{font-family:'Press Start 2P',monospace}.term{font-family:'VT323',monospace}@keyframes bb{from{width:0}to{width:100%}}@keyframes pl{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        <div className="text-7xl mb-5">🗾</div>
        <div className="pixel text-2xl mb-2" style={{ textShadow: `3px 3px 0 ${C.pink}` }}>NIPPON<span style={{ color: C.cyan }}>OS</span></div>
        <div className="term text-2xl mb-8" style={{ color: C.ochre }}>willkommen zurück, David</div>
        <button onClick={() => { beep(); boot(); }} className="pixel text-[11px] px-6 py-4" style={{ background: C.pink, color: C.cream, ...raised, animation: "pl 1.5s infinite" }}>
          ▶ EINLOGGEN
        </button>
      </div>
    );
  }

  const cursorUrl = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 2 L2 15 L6 11 L9 17 L11 16 L8 10 L14 10 Z' fill='%23fff' stroke='%23ff2a6d' stroke-width='1.5'/%3E%3C/svg%3E\") 2 2, auto";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ background: C.bg, color: C.cream, cursor: cursorUrl }} onPointerMove={onMove} onPointerUp={onUp}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        .pixel{font-family:'Press Start 2P',monospace}.term{font-family:'VT323',monospace}
        @keyframes nm{from{transform:translateX(100%)}to{transform:translateX(-100%)}}
        @keyframes nf{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes wig{0%,100%{transform:rotate(0)}25%{transform:rotate(-2deg)}75%{transform:rotate(2deg)}}
        @keyframes wo{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        .nl{color:${C.pink};text-decoration:none}.nl:hover{text-shadow:0 0 8px ${C.pink};text-decoration:underline}
        .nb:hover{animation:wig .3s}
      `}</style>

      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ backgroundImage: `linear-gradient(${C.cyan}10 1px,transparent 1px),linear-gradient(90deg,${C.cyan}10 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="absolute right-8 top-20 text-6xl opacity-15 pointer-events-none" style={{ animation: "nf 6s ease-in-out infinite" }} aria-hidden>🌙</div>

      <div className="relative overflow-hidden py-1 shrink-0" style={{ background: C.pink, borderBottom: `3px solid ${C.ink}` }}>
        <div className="term text-lg whitespace-nowrap" style={{ color: C.bg, animation: "nm 22s linear infinite" }}>
          ★ ようこそ！ NipponOS v0.3 ★ Doppelklick auf Desktop-Icons · Fenster ziehen/min/max ★ 日本大好き ★ START für alle Apps ★ jag die Katze nicht — sie folgt dir! 🐱 ★
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        <aside className="w-40 lg:w-52 shrink-0 overflow-y-auto p-2 flex flex-col gap-3 relative z-10" style={{ background: C.bg2, borderRight: `3px solid ${C.ink}` }}>
          <div className="text-center pt-1"><div className="pixel text-sm" style={{ color: C.cream, textShadow: `2px 2px 0 ${C.pink}` }}>NIPPON<span style={{ color: C.cyan }}>OS</span></div></div>
          <div className="p-1" style={{ background: C.cyan, ...raised }}>
            <div className="p-2 text-center" style={{ background: C.cream, color: C.ink }}>
              <div className="text-4xl" style={{ animation: "nf 4s ease-in-out infinite" }}>🗾</div>
              <div className="pixel text-[9px] my-1" style={{ color: C.pink }}>~ DAVID ~</div>
              <div className="term text-base leading-tight">Ramen-Jäger &amp;<br/>Foto-Sammler</div>
            </div>
          </div>
          <div className="p-1" style={{ background: C.ochre, ...raised }}>
            <div className="p-2" style={{ background: C.bg }}>
              <div className="pixel text-[8px] mb-2 text-center" style={{ color: C.ochre }}>● APPS ●</div>
              {APPS.map(a => (
                <button key={a.id} onClick={() => openApp(a.id)} className="nb term text-lg w-full text-left px-2 py-0.5 mb-1" style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>{a.icon} {a.title}</button>
              ))}
            </div>
          </div>
          <div className="p-2 term text-base" style={{ background: C.bg, ...sunken, color: C.cyan }}>
            <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>SYSTEMS</div>
            <div>NipponOS ··· <span style={{ color: "#33ff66" }}>OK</span></div>
            <div>Kamera ····· <span style={{ color: "#33ff66" }}>OK</span></div>
            <div>Magen ······ <span style={{ color: C.ochre }}>VOLL</span></div>
            <div>Heimweh ···· <span style={{ color: C.pink }}>12%</span></div>
          </div>
          <div className="p-2 text-center" style={{ background: C.ink, ...raised }}>
            <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>VISITORS</div>
            <span className="term text-xl px-2" style={{ background: "#000", color: "#33ff66", letterSpacing: "2px" }}>{String(visitors).padStart(6, "0")}</span>
          </div>
        </aside>

        <div id="neko-area" className="flex-1 relative overflow-hidden">
          {/* Desktop Icons */}
          <div className="absolute top-2 left-2 z-[2] flex flex-col gap-1.5">
            {DESKTOP_ICONS.map(id => {
              const m = winMeta(id, data);
              return (
                <button key={id} onDoubleClick={() => openApp(id)} onClick={() => { if (isMobile()) openApp(id); }}
                  className="flex flex-col items-center w-16 p-1 rounded-lg hover:bg-white/10 transition-colors" title="Doppelklick">
                  <span className="text-3xl">{m.icon}</span>
                  <span className="term text-sm text-center leading-none" style={{ color: C.cream, textShadow: "0 1px 2px #000" }}>{m.title}</span>
                </button>
              );
            })}
          </div>

          {/* Cat */}
          <button ref={catRef} onClick={() => click(990)} className="absolute top-0 left-0 text-3xl z-[5]" style={{ cursor: cursorUrl, willChange: "transform" }} title="にゃ～">🐱</button>

          {wins.filter(w => !w.min).map(w => (
            <WindowFrame key={w.id} win={w} data={data} onOpenPost={openPost}
              onClose={() => { click(440); closeWin(w.id); }} onFocus={() => focusWin(w.id)}
              onMin={() => { click(440); minWin(w.id); }} onMax={() => { click(); maxWin(w.id); }}
              onTitleDown={(e) => onTitleDown(e, w.id)} onBeep={click} />
          ))}
        </div>
      </div>

      {startOpen && (
        <>
          <div className="fixed inset-0 z-[25]" onClick={() => setStartOpen(false)} />
          <div className="absolute bottom-11 left-2 z-30 p-1 w-52" style={{ background: C.pink, ...raised }}>
            <div className="p-2" style={{ background: C.bg2 }}>
              <div className="pixel text-[8px] mb-2 text-center" style={{ color: C.cyan }}>★ NIPPON OS ★</div>
              {APPS.map(a => (
                <button key={a.id} onClick={() => openApp(a.id)} className="nb term text-lg w-full text-left px-2 py-1 mb-0.5" style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>{a.icon} {a.title}</button>
              ))}
              <div className="mt-1 pt-1" style={{ borderTop: `1px solid ${C.ink}` }}>
                <button onClick={shutdown} className="nb term text-lg w-full text-left px-2 py-1" style={{ color: C.ochre, ...sunken }}>⏻ Herunterfahren</button>
                <Link href="/" className="block term text-base w-full text-left px-2 py-1 mt-0.5 nl">🌐 zur echten Website</Link>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="shrink-0 h-10 flex items-center gap-2 px-2 relative z-30" style={{ background: C.bg2, borderTop: `3px solid ${C.ink}` }}>
        <button onClick={() => { click(); setStartOpen(s => !s); }} className="pixel text-[9px] px-2 py-1" style={{ background: startOpen ? C.cyan : C.pink, color: C.cream, ...raised }}>🗾 START</button>
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {wins.map(w => { const m = winMeta(w.id, data); return (
            <button key={w.id} onClick={() => taskClick(w.id)} className="term text-base px-2 whitespace-nowrap max-w-40 truncate" style={{ color: w.min ? "#999" : C.cream, ...sunken, background: w.min ? "transparent" : "rgba(255,255,255,0.08)" }}>{m.icon} {m.title}</button>
          ); })}
        </div>
        <button onClick={() => setSound(s => !s)} className="term text-base px-2" style={{ color: sound ? C.cyan : "#888", ...sunken }} title="Sound an/aus">{sound ? "🔊" : "🔇"}</button>
        <span className="term text-lg px-2 hidden sm:inline" style={{ color: C.cyan }}>🇯🇵 {clock}</span>
      </div>
    </div>
  );
}

function WindowFrame({ win, data, onOpenPost, onClose, onFocus, onMin, onMax, onTitleDown, onBeep }: {
  win: OpenWin; data: LabPost[]; onOpenPost: (id: string) => void; onClose: () => void; onFocus: () => void; onMin: () => void; onMax: () => void; onTitleDown: (e: React.PointerEvent) => void; onBeep: (f?: number) => void;
}) {
  const m = winMeta(win.id, data);
  const geom: React.CSSProperties = win.max ? { left: 0, top: 0, width: "100%", height: "100%" } : { left: win.x, top: win.y, width: `min(92vw, ${appWidth(win.id)}px)` };
  return (
    <div className="absolute p-1 flex flex-col" onPointerDown={onFocus} style={{ ...geom, zIndex: win.z, background: C.pink, ...raised, animation: "wo .2s ease-out", maxHeight: win.max ? "100%" : "84%" }}>
      <div onPointerDown={onTitleDown} className={`flex items-center justify-between px-2 py-1 shrink-0 ${win.max ? "" : "cursor-grab active:cursor-grabbing"}`} style={{ background: C.ink }}>
        <span className="term text-lg truncate" style={{ color: C.cream }}>{m.icon} {m.title}</span>
        <span className="flex gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onMin(); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Minimieren">_</button>
          <button onClick={(e) => { e.stopPropagation(); onMax(); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Maximieren">□</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Schließen">✕</button>
        </span>
      </div>
      <div className="p-3 overflow-y-auto flex-1" style={{ background: C.cream, color: C.ink }}>
        {win.id === "blog" && <BlogApp data={data} onOpenPost={onOpenPost} onBeep={onBeep} />}
        {win.id === "photo" && <PhotoApp data={data} />}
        {win.id === "video" && <VideoApp data={data} />}
        {win.id === "map" && <MapApp data={data} />}
        {win.id === "paint" && <PaintApp />}
        {win.id === "snake" && <SnakeApp />}
        {win.id === "about" && <AboutApp />}
        {win.id === "guestbook" && <GuestbookApp onBeep={onBeep} />}
        {win.id.startsWith("post:") && <PostDetailApp post={data.find(p => p._id === win.id.slice(5))} />}
      </div>
    </div>
  );
}

// ─── Apps ─────────────────────────────────────────────────────────────────────
function BlogApp({ data, onOpenPost, onBeep }: { data: LabPost[]; onOpenPost: (id: string) => void; onBeep: (f?: number) => void }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const allTags = Array.from(new Set(data.flatMap(p => p.tags ?? [])));
  const filtered = data.filter(p => {
    if (tag && !(p.tags ?? []).includes(tag)) return false;
    if (q && !`${p.title} ${p.excerpt} ${p.location}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div className="pixel text-[10px] mb-2" style={{ color: C.pink }}>✎ BLOG EXPLORER ✎</div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 suchen…" className="term text-lg w-full px-2 py-1 mb-2 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <button onClick={() => { onBeep(); setTag(null); }} className="term text-base px-2" style={{ ...(tag === null ? raised : sunken), background: tag === null ? C.pink : "#fff", color: tag === null ? C.cream : C.ink }}>📁 alle</button>
          {allTags.map(t => (
            <button key={t} onClick={() => { onBeep(); setTag(t === tag ? null : t); }} className="term text-base px-2" style={{ ...(tag === t ? raised : sunken), background: tag === t ? C.pink : "#fff", color: tag === t ? C.cream : C.ink }}>📁 {t}</button>
          ))}
        </div>
      )}
      <div className="term text-sm mb-2" style={{ color: C.ochre }}>{filtered.length} Einträge</div>
      <div className="flex flex-col gap-2">
        {filtered.map(p => (
          <button key={p._id} onClick={() => onOpenPost(p._id)} className="nb p-2 text-left flex gap-2 items-center" style={{ ...sunken, background: "#fff" }}>
            <div className="w-14 h-14 shrink-0 flex items-center justify-center" style={{ background: p.cover ? "transparent" : `linear-gradient(135deg,${C.pink},${C.cyan})` }}>
              {p.cover
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.cover} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">📄</span>}
            </div>
            <div className="min-w-0">
              <div className="term text-lg truncate" style={{ color: C.pink }}>{p.title}</div>
              <div className="term text-sm" style={{ color: C.ochre }}>{p.date ? new Date(p.date).toLocaleDateString("de-DE") : ""} · 📍 {p.location ?? "Japan"}</div>
              <div className="text-xs truncate" style={{ color: C.ink }}>{p.excerpt}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="term text-xl text-center py-4" style={{ color: C.ochre }}>nichts gefunden ◔_◔</div>}
      </div>
    </div>
  );
}

function PostDetailApp({ post }: { post?: LabPost }) {
  if (!post) return <div className="term text-xl">Post nicht gefunden.</div>;
  const photos = (post.photos ?? []).filter(p => p.url);
  return (
    <div>
      <div className="term text-2xl mb-1" style={{ color: C.pink }}>{post.title}</div>
      <div className="term text-base mb-3" style={{ color: C.ochre }}>{post.date ? new Date(post.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : ""} · 📍 {post.location ?? "Japan"}</div>
      {/* Foto */}
      <div className="p-1 mb-3" style={{ background: C.bg, ...sunken }}>
        {photos[0]?.url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photos[0].url} alt="" className="w-full max-h-64 object-cover" />
          : <div className="w-full h-44 flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg,${C.pink},${C.cyan})` }}>📷</div>}
      </div>
      <p className="text-sm leading-relaxed mb-3">{post.excerpt}</p>
      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-1 mb-3">
          {photos.slice(1).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p.url} alt="" className="w-full h-16 object-cover" style={{ ...sunken }} />
          ))}
        </div>
      )}
      {post.lat && post.lng && (
        <div className="p-1" style={{ background: C.bg, ...sunken }}>
          <MiniMap markers={[{ lat: post.lat, lng: post.lng, label: post.location ?? post.title }]} height="180px" zoom={11} />
        </div>
      )}
    </div>
  );
}

function PhotoApp({ data }: { data: LabPost[] }) {
  const photos = data.flatMap(p => (p.photos ?? []).filter(x => x.url).map(x => ({ ...x, post: p })));
  const pick = photos.length ? photos[Math.floor(Date.now() / 86400000) % photos.length] : null;
  return (
    <div className="text-center">
      <div className="pixel text-[10px] mb-2" style={{ color: C.pink }}>★ FOTO DES TAGES ★</div>
      <div className="p-1 inline-block w-full" style={{ background: C.bg, ...sunken }}>
        {pick?.url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={pick.url} alt="" className="w-full max-h-80 object-cover" />
          : <div className="w-full h-56 flex items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg,${C.pink},${C.cyan})` }}>📷</div>}
      </div>
      <div className="term text-lg mt-2" style={{ color: C.ochre }}>{pick?.caption ?? pick?.post?.location ?? "Noch keine Fotos — Demo"}</div>
    </div>
  );
}
function VideoApp({ data }: { data: LabPost[] }) {
  const withVid = data.find(p => p.youtubeId); const vid = withVid?.youtubeId ?? "jfKfPfyJRdk";
  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>▶ VIDEO DES TAGES ▶</div>
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${vid}`} title="Video des Tages" allowFullScreen />
      </div>
      <div className="term text-lg mt-2 text-center" style={{ color: C.ochre }}>{withVid ? withVid.title : "♪ heute läuft: Lofi für die Reise"}</div>
    </div>
  );
}
function MapApp({ data }: { data: LabPost[] }) {
  const markers = data.filter(p => p.lat && p.lng).map(p => ({ lat: p.lat!, lng: p.lng!, label: p.location ?? p.title }));
  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>🗺 MEINE ORTE 🗺</div>
      <div className="p-1" style={{ background: C.bg, ...sunken }}>
        {markers.length ? <MiniMap markers={markers} height="300px" zoom={6} /> : <div className="h-40 flex items-center justify-center term text-xl" style={{ color: C.cyan }}>noch keine Orte ◔_◔</div>}
      </div>
    </div>
  );
}
function AboutApp() {
  return (
    <div className="term text-xl leading-snug">
      <div className="pixel text-[10px] mb-3" style={{ color: C.pink }}>★ ÜBER MICH ★</div>
      <p>こんにちは！ Ich bin David 🙋</p>
      <p className="mt-2">Ich bleibe ein Jahr in Japan und sammle hier Momente — Fotos, Ramen-Funde, kleine Entdeckungen.</p>
      <p className="mt-2" style={{ color: C.pink }}>Lieblings-Konbini: 7-Eleven 🍙</p>
      <p style={{ color: C.ochre }}>Aktueller Skill: Stäbchen-Profi 🥢</p>
      <p className="mt-2">Dieses NipponOS ist mein kleines Eck im Netz. Bleib eine Weile! (-‿‿-)</p>
    </div>
  );
}
function GuestbookApp({ onBeep }: { onBeep: (f?: number) => void }) {
  interface Entry { name: string; msg: string; ts: number }
  const DEMO_E: Entry[] = [{ name: "Mama", msg: "Pass auf dich auf! ♥", ts: 0 }, { name: "Tom", msg: "Sieht mega aus, viel Spass!", ts: 0 }, { name: "???", msg: "ラーメン食べた？", ts: 0 }];
  const [entries, setEntries] = useState<Entry[]>([]); const [name, setName] = useState(""); const [msg, setMsg] = useState("");
  useEffect(() => { try { const s = localStorage.getItem("nippon-gb"); if (s) setEntries(JSON.parse(s)); } catch {} }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim() || !msg.trim()) return; onBeep(880);
    const next = [{ name: name.trim().slice(0, 24), msg: msg.trim().slice(0, 140), ts: Date.now() }, ...entries].slice(0, 30);
    setEntries(next); try { localStorage.setItem("nippon-gb", JSON.stringify(next)); } catch {} setName(""); setMsg("");
  }
  return (
    <div>
      <div className="pixel text-[10px] mb-3 text-center" style={{ color: C.pink }}>✉ GÄSTEBUCH ✉</div>
      <form onSubmit={submit} className="flex flex-col gap-2 mb-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" className="term text-lg px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
        <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Deine Nachricht…" rows={2} className="term text-lg px-2 py-1 resize-none outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
        <button type="submit" className="nb pixel text-[9px] px-3 py-2 self-end" style={{ background: C.pink, color: C.cream, ...raised }}>★ EINTRAGEN ★</button>
      </form>
      <div className="flex flex-col gap-2">
        {[...entries, ...DEMO_E].map((e, i) => (
          <div key={i} className="p-2 term text-lg" style={{ ...sunken, background: "#fff" }}><span style={{ color: C.pink }}>{e.name}:</span> <span style={{ color: C.ink }}>{e.msg}</span></div>
        ))}
      </div>
      <p className="term text-sm mt-2 text-center" style={{ color: C.ochre }}>(Einträge bleiben in deinem Browser ♥)</p>
    </div>
  );
}

// ─── Paint ────────────────────────────────────────────────────────────────────
function PaintApp() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(C.pink);
  const [size, setSize] = useState(5);
  const draw = useRef(false);
  const colors = [C.pink, C.cyan, C.ochre, C.ink, "#33ff66", "#ffffff"];
  function clear() { const c = ref.current?.getContext("2d"); if (!c || !ref.current) return; c.fillStyle = "#fff"; c.fillRect(0, 0, ref.current.width, ref.current.height); }
  useEffect(() => { clear(); }, []);
  function pos(e: React.PointerEvent) { const r = ref.current!.getBoundingClientRect(); return { x: (e.clientX - r.left) * (ref.current!.width / r.width), y: (e.clientY - r.top) * (ref.current!.height / r.height) }; }
  function down(e: React.PointerEvent) { draw.current = true; const c = ref.current!.getContext("2d")!; const p = pos(e); c.beginPath(); c.moveTo(p.x, p.y); }
  function move(e: React.PointerEvent) { if (!draw.current) return; const c = ref.current!.getContext("2d")!; const p = pos(e); c.lineTo(p.x, p.y); c.strokeStyle = color; c.lineWidth = size; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(); }
  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>🎨 PAINT 🎨</div>
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {colors.map(c => <button key={c} onClick={() => setColor(c)} className="w-6 h-6" style={{ background: c, ...(color === c ? raised : sunken) }} />)}
        <span className="term text-base ml-2" style={{ color: C.ink }}>Größe:</span>
        {[2, 5, 12].map(s => <button key={s} onClick={() => setSize(s)} className="term text-base px-2" style={{ ...(size === s ? raised : sunken), background: size === s ? C.pink : "#fff", color: size === s ? C.cream : C.ink }}>{s}</button>)}
        <button onClick={clear} className="term text-base px-2 ml-auto" style={{ ...sunken, background: "#fff", color: C.ink }}>🗑 leeren</button>
      </div>
      <canvas ref={ref} width={460} height={300} className="w-full touch-none" style={{ ...sunken, background: "#fff", cursor: "crosshair" }}
        onPointerDown={down} onPointerMove={move} onPointerUp={() => draw.current = false} onPointerLeave={() => draw.current = false} />
    </div>
  );
}

// ─── Snake ────────────────────────────────────────────────────────────────────
function SnakeApp() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const game = useRef({ snake: [{ x: 8, y: 8 }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 14, y: 8 } });
  const N = 20, CELL = 16;

  function reset() {
    game.current = { snake: [{ x: 8, y: 8 }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 14, y: 8 } };
    setScore(0); setOver(false); setRunning(true);
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const k = e.key; const g = game.current;
      const set = (x: number, y: number) => { if (g.dir.x !== -x || g.dir.y !== -y) g.next = { x, y }; };
      if (k === "ArrowUp" || k === "w") { set(0, -1); e.preventDefault(); }
      if (k === "ArrowDown" || k === "s") { set(0, 1); e.preventDefault(); }
      if (k === "ArrowLeft" || k === "a") { set(-1, 0); e.preventDefault(); }
      if (k === "ArrowRight" || k === "d") { set(1, 0); e.preventDefault(); }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const g = game.current; g.dir = g.next;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || g.snake.some(s => s.x === head.x && s.y === head.y)) {
        setOver(true); setRunning(false); return;
      }
      g.snake.unshift(head);
      if (head.x === g.food.x && head.y === g.food.y) {
        setScore(s => s + 1);
        g.food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
      } else g.snake.pop();
      // draw
      const c = ref.current?.getContext("2d"); if (!c) return;
      c.fillStyle = C.bg; c.fillRect(0, 0, N * CELL, N * CELL);
      c.fillStyle = C.pink; c.fillRect(g.food.x * CELL + 2, g.food.y * CELL + 2, CELL - 4, CELL - 4);
      g.snake.forEach((s, i) => { c.fillStyle = i === 0 ? C.cyan : C.ochre; c.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2); });
    }, 120);
    return () => clearInterval(iv);
  }, [running]);

  return (
    <div className="text-center">
      <div className="pixel text-[10px] mb-2" style={{ color: C.pink }}>🐍 SNAKE 🐍</div>
      <div className="term text-xl mb-2" style={{ color: C.ochre }}>Punkte: {score}</div>
      <div className="inline-block p-1 relative" style={{ background: C.ink, ...sunken }}>
        <canvas ref={ref} width={N * CELL} height={N * CELL} style={{ display: "block", imageRendering: "pixelated", maxWidth: "100%" }} />
        {(!running) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(26,26,46,0.85)" }}>
            {over && <div className="pixel text-xs" style={{ color: C.pink }}>GAME OVER</div>}
            <button onClick={reset} className="nb pixel text-[10px] px-3 py-2" style={{ background: C.cyan, color: C.bg, ...raised }}>{over ? "★ NOCHMAL ★" : "▶ START"}</button>
          </div>
        )}
      </div>
      <div className="term text-base mt-2" style={{ color: C.cyan }}>Pfeiltasten oder WASD</div>
    </div>
  );
}
