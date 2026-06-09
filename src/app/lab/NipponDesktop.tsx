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

function beep() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext); if (!Ctx) return;
    const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "square"; o.frequency.value = 660; g.gain.value = 0.04;
    o.connect(g); g.connect(ctx.destination); o.start();
    o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12); o.stop(ctx.currentTime + 0.12);
  } catch {}
}

// ─── Apps ─────────────────────────────────────────────────────────────────────
const APPS = [
  { id: "blog",      icon: "✎", title: "Blog.exe" },
  { id: "photo",     icon: "📷", title: "Foto des Tages" },
  { id: "video",     icon: "▶", title: "Video des Tages" },
  { id: "map",       icon: "🗺", title: "Karte" },
  { id: "about",     icon: "★", title: "Über mich" },
  { id: "guestbook", icon: "✉", title: "Gästebuch" },
];

interface OpenWin { id: string; x: number; y: number; z: number }

export default function NipponDesktop({ posts }: { posts: LabPost[] }) {
  const data = posts.length >= 2 ? posts : [...posts, ...DEMO];
  const [wins, setWins] = useState<OpenWin[]>([]);
  const [clock, setClock] = useState("");
  const [visitors, setVisitors] = useState(1337);
  const [sound, setSound] = useState(true);
  const z = useRef(10);
  const drag = useRef<{ id: string; sx: number; sy: number; wx: number; wy: number } | null>(null);
  const soundRef = useRef(true); soundRef.current = sound;

  const click = () => { if (soundRef.current) beep(); };

  useEffect(() => {
    setVisitors(1337 + Math.floor((Date.now() / 86400000) % 500));
    // Blog beim Start öffnen
    z.current += 1;
    setWins([{ id: "blog", x: 60, y: 30, z: z.current }, { id: "photo", x: 420, y: 90, z: z.current + 1 }]);
    z.current += 1;
    function tick() { setClock(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })); }
    tick(); const t = setInterval(tick, 20000); return () => clearInterval(t);
  }, []);

  function openApp(id: string) {
    click();
    setWins(prev => {
      const ex = prev.find(w => w.id === id);
      z.current += 1;
      if (ex) return prev.map(w => w.id === id ? { ...w, z: z.current } : w);
      const off = prev.length * 26;
      return [...prev, { id, x: 80 + off, y: 40 + off, z: z.current }];
    });
  }
  const closeWin = (id: string) => setWins(p => p.filter(w => w.id !== id));
  const focusWin = (id: string) => setWins(p => { z.current += 1; return p.map(w => w.id === id ? { ...w, z: z.current } : w); });

  function onTitleDown(e: React.PointerEvent, id: string) {
    const w = wins.find(x => x.id === id); if (!w) return;
    focusWin(id);
    drag.current = { id, sx: e.clientX, sy: e.clientY, wx: w.x, wy: w.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const d = drag.current;
    setWins(p => p.map(w => w.id === d.id ? { ...w, x: d.wx + (e.clientX - d.sx), y: Math.max(0, d.wy + (e.clientY - d.sy)) } : w));
  }
  const onUp = () => { drag.current = null; };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ background: C.bg, color: C.cream }}
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

      {/* Deko */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ backgroundImage: `linear-gradient(${C.cyan}10 1px,transparent 1px),linear-gradient(90deg,${C.cyan}10 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="absolute right-8 top-20 text-6xl opacity-15 pointer-events-none" style={{ animation: "nf 6s ease-in-out infinite" }} aria-hidden>🌙</div>

      {/* Marquee */}
      <div className="relative overflow-hidden py-1 shrink-0" style={{ background: C.pink, borderBottom: `3px solid ${C.ink}` }}>
        <div className="term text-lg whitespace-nowrap" style={{ color: C.bg, animation: "nm 20s linear infinite" }}>
          ★ ようこそ！ NipponOS gestartet ★ Klicke links auf eine App um ein Fenster zu öffnen ★ 日本大好き ★ Fenster lassen sich ziehen! ★
        </div>
      </div>

      {/* Mitte: Sidebar + Desktop */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        <aside className="w-44 lg:w-52 shrink-0 overflow-y-auto p-2 flex flex-col gap-3 relative z-10" style={{ background: C.bg2, borderRight: `3px solid ${C.ink}` }}>
          <div className="text-center pt-1">
            <div className="pixel text-base" style={{ color: C.cream, textShadow: `2px 2px 0 ${C.pink}` }}>NIPPON<span style={{ color: C.cyan }}>OS</span></div>
          </div>
          {/* Profil */}
          <div className="p-1" style={{ background: C.cyan, ...raised }}>
            <div className="p-2 text-center" style={{ background: C.cream, color: C.ink }}>
              <div className="text-4xl" style={{ animation: "nf 4s ease-in-out infinite" }}>🗾</div>
              <div className="pixel text-[9px] my-1" style={{ color: C.pink }}>~ DAVID ~</div>
              <div className="term text-base leading-tight">Ramen-Jäger &amp;<br/>Foto-Sammler</div>
            </div>
          </div>
          {/* Launcher */}
          <div className="p-1" style={{ background: C.ochre, ...raised }}>
            <div className="p-2" style={{ background: C.bg }}>
              <div className="pixel text-[8px] mb-2 text-center" style={{ color: C.ochre }}>● APPS ●</div>
              {APPS.map(a => (
                <button key={a.id} onClick={() => openApp(a.id)} className="nb term text-lg w-full text-left px-2 py-0.5 mb-1"
                  style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>
                  {a.icon} {a.title}
                </button>
              ))}
            </div>
          </div>
          {/* Systems status (à la dimden) */}
          <div className="p-2 term text-base" style={{ background: C.bg, ...sunken, color: C.cyan }}>
            <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>SYSTEMS</div>
            <div>NipponOS ··· <span style={{ color: "#33ff66" }}>OK</span></div>
            <div>Kamera ····· <span style={{ color: "#33ff66" }}>OK</span></div>
            <div>Magen ······ <span style={{ color: C.ochre }}>VOLL</span></div>
            <div>Heimweh ···· <span style={{ color: C.pink }}>12%</span></div>
          </div>
          {/* Counter */}
          <div className="p-2 text-center" style={{ background: C.ink, ...raised }}>
            <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>VISITORS</div>
            <span className="term text-xl px-2" style={{ background: "#000", color: "#33ff66", letterSpacing: "2px" }}>{String(visitors).padStart(6, "0")}</span>
          </div>
          {/* Now playing */}
          <div className="p-2 term text-base text-center" style={{ background: C.bg, ...sunken, color: C.ochre }}>
            ♪ now playing ♪<br/><span style={{ color: C.pink }}>City Pop Mix &apos;84</span>
          </div>
        </aside>

        {/* Desktop area */}
        <div className="flex-1 relative overflow-hidden">
          {wins.map(w => (
            <WindowFrame key={w.id} win={w} data={data} onClose={() => closeWin(w.id)} onFocus={() => focusWin(w.id)}
              onTitleDown={(e) => onTitleDown(e, w.id)} onBeep={click} />
          ))}
          {wins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pixel text-xs text-center" style={{ color: C.cyan }}>← öffne eine App<br/><span className="term text-xl">(◕‿◕)</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Taskbar */}
      <div className="shrink-0 h-10 flex items-center gap-2 px-2 relative z-20" style={{ background: C.bg2, borderTop: `3px solid ${C.ink}` }}>
        <span className="pixel text-[9px] px-2 py-1" style={{ background: C.pink, color: C.cream, ...raised }}>🗾 START</span>
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {wins.map(w => {
            const app = APPS.find(a => a.id === w.id);
            return (
              <button key={w.id} onClick={() => focusWin(w.id)} className="term text-base px-2 whitespace-nowrap" style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>
                {app?.icon} {app?.title}
              </button>
            );
          })}
        </div>
        <button onClick={() => { setSound(s => !s); }} className="term text-base px-2" style={{ color: sound ? C.cyan : "#888", ...sunken }} title="Sound an/aus">
          {sound ? "🔊" : "🔇"}
        </button>
        <Link href="/" className="term text-base px-2 nl">← Website</Link>
        <span className="term text-lg px-2" style={{ color: C.cyan }}>🇯🇵 {clock}</span>
      </div>
    </div>
  );
}

// ─── Window frame ─────────────────────────────────────────────────────────────
function WindowFrame({ win, data, onClose, onFocus, onTitleDown, onBeep }: {
  win: OpenWin; data: LabPost[]; onClose: () => void; onFocus: () => void; onTitleDown: (e: React.PointerEvent) => void; onBeep: () => void;
}) {
  const app = APPS.find(a => a.id === win.id);
  return (
    <div className="absolute p-1" onPointerDown={onFocus}
      style={{ left: win.x, top: win.y, zIndex: win.z, width: "min(92vw, 480px)", background: C.pink, ...raised, animation: "wo .2s ease-out" }}>
      {/* Titelleiste */}
      <div onPointerDown={onTitleDown} className="flex items-center justify-between px-2 py-1 cursor-grab active:cursor-grabbing" style={{ background: C.ink }}>
        <span className="term text-lg truncate" style={{ color: C.cream }}>{app?.icon} {app?.title}</span>
        <button onClick={(e) => { e.stopPropagation(); onBeep(); onClose(); }} className="term text-sm w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title="Schließen">✕</button>
      </div>
      {/* Inhalt */}
      <div className="p-3 overflow-y-auto" style={{ background: C.cream, color: C.ink, maxHeight: "70vh" }}>
        <AppContent id={win.id} data={data} onBeep={onBeep} />
      </div>
    </div>
  );
}

// ─── App-Inhalte ──────────────────────────────────────────────────────────────
function AppContent({ id, data, onBeep }: { id: string; data: LabPost[]; onBeep: () => void }) {
  if (id === "blog") {
    return (
      <div className="flex flex-col gap-3">
        {data.map(p => (
          <div key={p._id} className="p-2" style={{ ...sunken, background: "#fff" }}>
            <div className="term text-lg" style={{ color: C.pink }}>▓ {p.title}</div>
            <div className="term text-sm" style={{ color: C.ochre }}>{p.date ? new Date(p.date).toLocaleDateString("de-DE") : ""} · 📍 {p.location ?? "Japan"}</div>
            <p className="text-sm mt-1">{p.excerpt}</p>
            <button onClick={onBeep} className="nb term text-base nl mt-1">» weiterlesen «</button>
          </div>
        ))}
      </div>
    );
  }
  if (id === "photo") {
    const photos = data.flatMap(p => (p.photos ?? []).filter(x => x.url).map(x => ({ ...x, post: p })));
    const day = Math.floor(Date.now() / 86400000);
    const pick = photos.length ? photos[day % photos.length] : null;
    return (
      <div className="text-center">
        <div className="pixel text-[10px] mb-2" style={{ color: C.pink }}>★ FOTO DES TAGES ★</div>
        <div className="p-1 inline-block w-full" style={{ background: C.bg, ...sunken }}>
          {pick?.url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={pick.url} alt="" className="w-full max-h-72 object-cover" />
            : <div className="w-full h-56 flex items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg,${C.pink},${C.cyan})` }}>📷</div>}
        </div>
        <div className="term text-lg mt-2" style={{ color: C.ochre }}>{pick?.caption ?? pick?.post?.location ?? "Noch keine Fotos — Demo"}</div>
      </div>
    );
  }
  if (id === "video") {
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
  if (id === "map") {
    const markers = data.filter(p => p.lat && p.lng).map(p => ({ lat: p.lat!, lng: p.lng!, label: p.location ?? p.title }));
    return (
      <div>
        <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>🗺 MEINE ORTE 🗺</div>
        <div className="p-1" style={{ background: C.bg, ...sunken }}>
          {markers.length ? <MiniMap markers={markers} height="260px" zoom={6} /> : <div className="h-40 flex items-center justify-center term text-xl" style={{ color: C.cyan }}>noch keine Orte ◔_◔</div>}
        </div>
      </div>
    );
  }
  if (id === "about") {
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
  // guestbook
  return (
    <div className="text-center">
      <div className="pixel text-[10px] mb-3" style={{ color: C.pink }}>✉ GÄSTEBUCH ✉</div>
      <div className="flex flex-col gap-2 text-left mb-3">
        {[["Mama","Pass auf dich auf! ♥"],["Tom","Sieht mega aus, viel Spass!"],["???","ラーメン食べた？"]].map(([n,m],i)=>(
          <div key={i} className="p-2 term text-lg" style={{ ...sunken, background:"#fff" }}>
            <span style={{ color: C.pink }}>{n}:</span> <span style={{ color: C.ink }}>{m}</span>
          </div>
        ))}
      </div>
      <button onClick={onBeep} className="nb pixel text-[9px] px-3 py-2" style={{ background: C.pink, color: C.cream, ...raised }}>★ EINTRAGEN ★</button>
    </div>
  );
}
