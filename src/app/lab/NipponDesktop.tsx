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
  { _id: "d1", title: "Shinjuku bei Nacht ✨", location: "Tōkyō, Shinjuku", lat: 35.6938, lng: 139.7034, date: "2026-06-20", excerpt: "Neon überall. Ich stehe mitten im Cyberpunk-Traum und kann nicht aufhören zu staunen.", photos: [{}, {}] },
  { _id: "d2", title: "Ramen ohne Schild 🍜", location: "Nakano", lat: 35.7056, lng: 139.6657, date: "2026-06-22", excerpt: "Sechs Plätze, ein roter Vorhang, kein Name. Der beste Tonkotsu meines Lebens.", photos: [{}], youtubeId: "jfKfPfyJRdk" },
  { _id: "d3", title: "Morgens am Tempel ⛩️", location: "Asakusa", lat: 35.7148, lng: 139.7967, date: "2026-06-25", excerpt: "Um 6 Uhr ist der Sensō-ji fast leer. Räucherstäbchen, Glocken, Stille.", photos: [{}, {}, {}] },
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
  { id: "about", icon: "★", title: "Über mich" },
  { id: "guestbook", icon: "✉", title: "Gästebuch" },
];

interface OpenWin { id: string; x: number; y: number; z: number; min?: boolean; max?: boolean }

export default function NipponDesktop({ posts }: { posts: LabPost[] }) {
  const data = posts.length >= 2 ? posts : [...posts, ...DEMO];
  const [booted, setBooted] = useState(false);
  const [wins, setWins] = useState<OpenWin[]>([]);
  const [clock, setClock] = useState("");
  const [visitors, setVisitors] = useState(1337);
  const [sound, setSound] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [neko, setNeko] = useState({ x: 200, y: 200 });
  const z = useRef(10);
  const drag = useRef<{ id: string; sx: number; sy: number; wx: number; wy: number } | null>(null);
  const soundRef = useRef(true); soundRef.current = sound;
  const click = (f = 660) => { if (soundRef.current) beep(f); };
  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 760;

  useEffect(() => {
    const t = setTimeout(() => {
      setBooted(true); z.current += 2;
      setWins([{ id: "blog", x: 60, y: 24, z: 11, max: isMobile() }, ...(isMobile() ? [] : [{ id: "photo", x: 430, y: 80, z: 12 }])]);
    }, 1700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setVisitors(1337 + Math.floor((Date.now() / 86400000) % 500));
    function tick() { setClock(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })); }
    tick(); const t = setInterval(tick, 20000);
    const nk = setInterval(() => {
      const el = document.getElementById("neko-area");
      const w = el?.clientWidth ?? 600, h = el?.clientHeight ?? 400;
      setNeko({ x: 40 + Math.random() * Math.max(80, w - 120), y: 40 + Math.random() * Math.max(80, h - 120) });
    }, 3500);
    return () => { clearInterval(t); clearInterval(nk); };
  }, [booted]);

  function openApp(id: string) {
    click(); setStartOpen(false);
    setWins(prev => {
      const ex = prev.find(w => w.id === id); z.current += 1;
      if (ex) return prev.map(w => w.id === id ? { ...w, z: z.current, min: false } : w);
      const off = prev.length * 24;
      return [...prev, { id, x: 70 + off, y: 30 + off, z: z.current, max: isMobile() }];
    });
  }
  const closeWin = (id: string) => setWins(p => p.filter(w => w.id !== id));
  const focusWin = (id: string) => setWins(p => { z.current += 1; return p.map(w => w.id === id ? { ...w, z: z.current } : w); });
  const minWin = (id: string) => setWins(p => p.map(w => w.id === id ? { ...w, min: true } : w));
  const maxWin = (id: string) => setWins(p => p.map(w => w.id === id ? { ...w, max: !w.max } : w));
  const taskClick = (id: string) => { click(); z.current += 1; const zz = z.current; setWins(p => p.map(w => w.id === id ? { ...w, min: false, z: zz } : w)); };

  function onTitleDown(e: React.PointerEvent, id: string) {
    const w = wins.find(x => x.id === id); if (!w || w.max) return;
    focusWin(id);
    drag.current = { id, sx: e.clientX, sy: e.clientY, wx: w.x, wy: w.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return; const d = drag.current;
    setWins(p => p.map(w => w.id === d.id ? { ...w, x: d.wx + (e.clientX - d.sx), y: Math.max(0, d.wy + (e.clientY - d.sy)) } : w));
  }
  const onUp = () => { drag.current = null; };

  if (!booted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: C.bg, color: C.cream }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');.pixel{font-family:'Press Start 2P',monospace}.term{font-family:'VT323',monospace}@keyframes bb{from{width:0}to{width:100%}}`}</style>
        <div className="text-7xl mb-5">🗾</div>
        <div className="pixel text-2xl mb-2" style={{ textShadow: `3px 3px 0 ${C.pink}` }}>NIPPON<span style={{ color: C.cyan }}>OS</span></div>
        <div className="term text-2xl mb-6" style={{ color: C.ochre }}>wird gestartet…</div>
        <div className="w-56 h-3 p-0.5" style={{ background: C.bg2, ...sunken }}>
          <div className="h-full" style={{ background: C.cyan, animation: "bb 1.5s ease-out forwards" }} />
        </div>
      </div>
    );
  }

  const cursorUrl = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M2 2 L2 15 L6 11 L9 17 L11 16 L8 10 L14 10 Z' fill='%23fff' stroke='%23ff2a6d' stroke-width='1.5'/%3E%3C/svg%3E\") 2 2, auto";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ background: C.bg, color: C.cream, cursor: cursorUrl }}
      onPointerMove={onMove} onPointerUp={onUp}>
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
          ★ ようこそ！ NipponOS v0.2 ★ Fenster ziehen · minimieren _ · maximieren □ · schliessen ✕ ★ 日本大好き ★ klick START für alle Apps ★
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
          <button onClick={() => click(990)} className="absolute text-3xl z-[5] transition-all" style={{ left: neko.x, top: neko.y, transitionDuration: "2.8s", transitionTimingFunction: "ease-in-out", cursor: cursorUrl }} title="にゃ～">🐱</button>
          {wins.filter(w => !w.min).map(w => (
            <WindowFrame key={w.id} win={w} data={data} onClose={() => { click(440); closeWin(w.id); }} onFocus={() => focusWin(w.id)}
              onMin={() => { click(440); minWin(w.id); }} onMax={() => { click(); maxWin(w.id); }} onTitleDown={(e) => onTitleDown(e, w.id)} onBeep={click} />
          ))}
          {wins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pixel text-xs text-center" style={{ color: C.cyan }}>← öffne eine App<br/><span className="term text-xl">(◕‿◕)</span></div>
            </div>
          )}
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
              <Link href="/" className="block term text-lg w-full text-left px-2 py-1 mt-1 nl" style={{ ...sunken }}>⏻ zurück zur Website</Link>
            </div>
          </div>
        </>
      )}

      <div className="shrink-0 h-10 flex items-center gap-2 px-2 relative z-30" style={{ background: C.bg2, borderTop: `3px solid ${C.ink}` }}>
        <button onClick={() => { click(); setStartOpen(s => !s); }} className="pixel text-[9px] px-2 py-1" style={{ background: startOpen ? C.cyan : C.pink, color: C.cream, ...raised }}>🗾 START</button>
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {wins.map(w => {
            const app = APPS.find(a => a.id === w.id);
            return (
              <button key={w.id} onClick={() => taskClick(w.id)} className="term text-base px-2 whitespace-nowrap" style={{ color: w.min ? "#999" : C.cream, ...sunken, background: w.min ? "transparent" : "rgba(255,255,255,0.08)" }}>{app?.icon} {app?.title}</button>
            );
          })}
        </div>
        <button onClick={() => setSound(s => !s)} className="term text-base px-2" style={{ color: sound ? C.cyan : "#888", ...sunken }} title="Sound an/aus">{sound ? "🔊" : "🔇"}</button>
        <span className="term text-lg px-2 hidden sm:inline" style={{ color: C.cyan }}>🇯🇵 {clock}</span>
      </div>
    </div>
  );
}

function WindowFrame({ win, data, onClose, onFocus, onMin, onMax, onTitleDown, onBeep }: {
  win: OpenWin; data: LabPost[]; onClose: () => void; onFocus: () => void; onMin: () => void; onMax: () => void; onTitleDown: (e: React.PointerEvent) => void; onBeep: (f?: number) => void;
}) {
  const app = APPS.find(a => a.id === win.id);
  const geom: React.CSSProperties = win.max ? { left: 0, top: 0, width: "100%", height: "100%" } : { left: win.x, top: win.y, width: "min(92vw, 480px)" };
  return (
    <div className="absolute p-1 flex flex-col" onPointerDown={onFocus}
      style={{ ...geom, zIndex: win.z, background: C.pink, ...raised, animation: "wo .2s ease-out", maxHeight: win.max ? "100%" : "82%" }}>
      <div onPointerDown={onTitleDown} className={`flex items-center justify-between px-2 py-1 shrink-0 ${win.max ? "" : "cursor-grab active:cursor-grabbing"}`} style={{ background: C.ink }}>
        <span className="term text-lg truncate" style={{ color: C.cream }}>{app?.icon} {app?.title}</span>
        <span className="flex gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onMin(); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Minimieren">_</button>
          <button onClick={(e) => { e.stopPropagation(); onMax(); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Maximieren">□</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Schließen">✕</button>
        </span>
      </div>
      <div className="p-3 overflow-y-auto flex-1" style={{ background: C.cream, color: C.ink }}>
        {win.id === "blog" && <BlogApp data={data} onBeep={onBeep} />}
        {win.id === "photo" && <PhotoApp data={data} />}
        {win.id === "video" && <VideoApp data={data} />}
        {win.id === "map" && <MapApp data={data} />}
        {win.id === "about" && <AboutApp />}
        {win.id === "guestbook" && <GuestbookApp onBeep={onBeep} />}
      </div>
    </div>
  );
}

function BlogApp({ data, onBeep }: { data: LabPost[]; onBeep: (f?: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map(p => (
        <div key={p._id} className="p-2" style={{ ...sunken, background: "#fff" }}>
          <div className="term text-lg" style={{ color: C.pink }}>▓ {p.title}</div>
          <div className="term text-sm" style={{ color: C.ochre }}>{p.date ? new Date(p.date).toLocaleDateString("de-DE") : ""} · 📍 {p.location ?? "Japan"}</div>
          <p className="text-sm mt-1">{p.excerpt}</p>
          <button onClick={() => onBeep()} className="nb term text-base nl mt-1">» weiterlesen «</button>
        </div>
      ))}
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
  const withVid = data.find(p => p.youtubeId);
  const vid = withVid?.youtubeId ?? "jfKfPfyJRdk";
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
  const DEMO_E: Entry[] = [
    { name: "Mama", msg: "Pass auf dich auf! ♥", ts: 0 },
    { name: "Tom", msg: "Sieht mega aus, viel Spass!", ts: 0 },
    { name: "???", msg: "ラーメン食べた？", ts: 0 },
  ];
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { try { const s = localStorage.getItem("nippon-gb"); if (s) setEntries(JSON.parse(s)); } catch {} }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    onBeep(880);
    const next = [{ name: name.trim().slice(0, 24), msg: msg.trim().slice(0, 140), ts: Date.now() }, ...entries].slice(0, 30);
    setEntries(next);
    try { localStorage.setItem("nippon-gb", JSON.stringify(next)); } catch {}
    setName(""); setMsg("");
  }
  const all = [...entries, ...DEMO_E];
  return (
    <div>
      <div className="pixel text-[10px] mb-3 text-center" style={{ color: C.pink }}>✉ GÄSTEBUCH ✉</div>
      <form onSubmit={submit} className="flex flex-col gap-2 mb-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" className="term text-lg px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
        <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Deine Nachricht…" rows={2} className="term text-lg px-2 py-1 resize-none outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
        <button type="submit" className="nb pixel text-[9px] px-3 py-2 self-end" style={{ background: C.pink, color: C.cream, ...raised }}>★ EINTRAGEN ★</button>
      </form>
      <div className="flex flex-col gap-2">
        {all.map((e, i) => (
          <div key={i} className="p-2 term text-lg" style={{ ...sunken, background: "#fff" }}>
            <span style={{ color: C.pink }}>{e.name}:</span> <span style={{ color: C.ink }}>{e.msg}</span>
          </div>
        ))}
      </div>
      <p className="term text-sm mt-2 text-center" style={{ color: C.ochre }}>(Einträge bleiben in deinem Browser gespeichert ♥)</p>
    </div>
  );
}
