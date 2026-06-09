"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MiniMap from "@/components/MiniMap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/components/LanguageProvider";

interface Photo { url?: string; caption?: string }
interface LabPost {
  _id: string; title: string; slug?: string; date?: string; location?: string;
  lat?: number; lng?: number; excerpt?: string; excerptEN?: string; tags?: string[]; youtubeId?: string;
  cover?: string; coverImage?: string; photos?: Photo[];
}

const C = { bg: "#1a1a2e", bg2: "#16213e", cream: "#fdfaf6", pink: "#ff2a6d", cyan: "#3df0e0", ochre: "#e8a13a", ink: "#2a2a3a" };
const raised: React.CSSProperties = { boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.5), inset -2px -2px 0 rgba(0,0,0,0.4)" };
const sunken: React.CSSProperties = { boxShadow: "inset -2px -2px 0 rgba(255,255,255,0.4), inset 2px 2px 0 rgba(0,0,0,0.4)" };


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

type Lng = "de" | "en";
const KOFI_URL = "https://ko-fi.com/davidae";
const APPS = [
  { id: "blog", icon: "✎", title: "Blog.exe", titleEN: "Blog.exe" },
  { id: "japanisch", icon: "🎌", title: "Japanisch", titleEN: "Japanese" },
  { id: "photo", icon: "📷", title: "Foto des Tages", titleEN: "Photo of the Day" },
  { id: "video", icon: "▶", title: "Video des Tages", titleEN: "Video of the Day" },
  { id: "map", icon: "🗺", title: "Karte", titleEN: "Map" },
  { id: "bucket", icon: "🎯", title: "Bucket List", titleEN: "Bucket List" },
  { id: "paint", icon: "🎨", title: "Paint", titleEN: "Paint" },
  { id: "snake", icon: "🐍", title: "Snake", titleEN: "Snake" },
  { id: "pong", icon: "🏓", title: "Pong", titleEN: "Pong" },
  { id: "newsletter", icon: "📧", title: "Newsletter", titleEN: "Newsletter" },
  { id: "guestbook", icon: "✉", title: "Gästebuch", titleEN: "Guestbook" },
  { id: "about", icon: "★", title: "Über mich", titleEN: "About me" },
];
function appTitle(a: { title: string; titleEN?: string }, lang: Lng) { return lang === "en" ? (a.titleEN ?? a.title) : a.title; }
const DESKTOP_ICONS = ["blog", "japanisch", "photo", "video", "map", "bucket", "paint", "snake", "pong", "guestbook"];
// Linkes Sidebar-Menü: nur die wichtigen Apps (Spiele nur über Icons + Start)
const SIDEBAR_APPS = ["blog", "japanisch", "photo", "video", "map", "bucket", "newsletter", "guestbook", "about"];
// Start-Menü: Top-Level + ausklappbarer "Programme"-Ordner (wie Windows)
const START_TOP = ["blog", "japanisch", "photo", "video", "map", "bucket", "guestbook"];
const START_PROGRAMS = ["paint", "snake", "pong", "newsletter", "about"];
const W: Record<string, number> = { blog: 560, japanisch: 600, video: 560, map: 520, bucket: 480, paint: 520, snake: 340, pong: 360, newsletter: 440, about: 440, guestbook: 460, photo: 440 };
function appWidth(id: string) { return id.startsWith("post:") ? 540 : (W[id] ?? 460); }
function winMeta(id: string, data: LabPost[], lang: Lng = "de") {
  if (id.startsWith("post:")) { const p = data.find(x => x._id === id.slice(5)); return { icon: "📄", title: p?.title ?? "Post" }; }
  const a = APPS.find(x => x.id === id); return { icon: a?.icon ?? "▢", title: a ? appTitle(a, lang) : id };
}

interface OpenWin { id: string; x: number; y: number; z: number; min?: boolean; max?: boolean }
interface SysLine { label: string; value: string; color?: string }
interface NipponSettings {
  bannerText: string;
  systems: SysLine[];
  photoOfDay?: { url: string; caption?: string } | null;
  videoOfDay?: { id: string; title?: string } | null;
  departureDate?: string | null;
}

export default function NipponDesktop({ posts, onSwitchSimple }: { posts: LabPost[]; onSwitchSimple?: () => void }) {
  const { lang, toggle: toggleLang } = useLanguage();
  const L = (de: string, en: string) => (lang === "en" ? en : de);
  const data = posts;
  const [booted, setBooted] = useState(false);
  const [shutting, setShutting] = useState(false);
  const [wins, setWins] = useState<OpenWin[]>([]);
  const [clock, setClock] = useState("");
  const [visitors, setVisitors] = useState(1337);
  const [sound, setSound] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [progOpen, setProgOpen] = useState(false);
  const [kofiOpen, setKofiOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<NipponSettings | null>(null);
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
    // Ko-fi "Banner-Ad" einmal pro Session nach kurzer Zeit aufploppen lassen
    let shown = false;
    try { shown = sessionStorage.getItem("nippon-kofi-seen") === "1"; } catch {}
    if (!shown) {
      setTimeout(() => {
        setKofiOpen(true);
        try { sessionStorage.setItem("nippon-kofi-seen", "1"); } catch {}
      }, 25000);
    }
  }
  function shutdown() {
    click(330); setStartOpen(false); setShutting(true);
    setTimeout(() => { setShutting(false); setBooted(false); setWins([]); }, 1100);
  }


  useEffect(() => {
    setVisitors(1337 + Math.floor((Date.now() / 86400000) % 500));
    fetch("/api/nippon-settings").then(r => r.json()).then(setSettings).catch(() => {});
    function tick() { setClock(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })); }
    tick(); const t = setInterval(tick, 20000); return () => clearInterval(t);
  }, []);

  const sysColor: Record<string, string> = { green: "#33ff66", pink: C.pink, ochre: C.ochre, cyan: C.cyan };

  // Tage in Japan aus dem "Abreisedatum" der Website-Einstellungen (Studio)
  function japanLine(): SysLine | null {
    const dep = settings?.departureDate;
    if (!dep) return null;
    const start = new Date(dep).getTime();
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;
    if (now >= start) {
      const days = Math.floor((now - start) / dayMs);
      return { label: "Japan", value: L(`Tag ${days}`, `Day ${days}`), color: "cyan" };
    }
    const until = Math.ceil((start - now) / dayMs);
    return { label: L("Ankunft", "Arrival"), value: L(`in ${until}T`, `in ${until}d`), color: "ochre" };
  }
  const jLine = japanLine();

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
        catPos.current.x += (tx - catPos.current.x) * 0.018;
        catPos.current.y += (ty - catPos.current.y) * 0.018;
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
    click(); setStartOpen(false); setProgOpen(false);
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
        <div className="term text-2xl mb-8" style={{ color: C.ochre }}>{lang === "en" ? "welcome back" : "willkommen zurück"}</div>
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

      <div className="relative overflow-hidden py-1 shrink-0" style={{ background: C.pink, borderBottom: `3px solid ${C.ink}` }}>
        <div className="term text-lg whitespace-nowrap" style={{ color: C.bg, animation: "nm 22s linear infinite" }}>
          {settings?.bannerText ?? "★ ようこそ！ NipponOS ★ Doppelklick auf Desktop-Icons · Fenster ziehen ★ 日本大好き ★"}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        <aside className="w-40 lg:w-52 shrink-0 overflow-y-auto p-2 hidden md:flex flex-col gap-3 relative z-10" style={{ background: C.bg2, borderRight: `3px solid ${C.ink}` }}>
          <div className="text-center pt-1"><div className="pixel text-sm" style={{ color: C.cream, textShadow: `2px 2px 0 ${C.pink}` }}>NIPPON<span style={{ color: C.cyan }}>OS</span></div></div>
          <div className="p-1" style={{ background: C.cyan, ...raised }}>
            <div className="p-2 text-center" style={{ background: C.cream, color: C.ink }}>
              <div className="text-4xl" style={{ animation: "nf 4s ease-in-out infinite" }}>🗾</div>
              <div className="pixel text-[9px] my-1" style={{ color: C.pink }}>~ DAVID ~</div>
              <div className="term text-base leading-tight">{L("Ramen-Jäger &", "Ramen hunter &")}<br/>{L("Foto-Sammler", "photo collector")}</div>
            </div>
          </div>
          <div className="p-1" style={{ background: C.ochre, ...raised }}>
            <div className="p-2" style={{ background: C.bg }}>
              <div className="pixel text-[8px] mb-2 text-center" style={{ color: C.ochre }}>● APPS ●</div>
              {SIDEBAR_APPS.map(id => { const a = APPS.find(x => x.id === id)!; return (
                <button key={a.id} onClick={() => openApp(a.id)} className="nb term text-lg w-full text-left px-2 py-0.5 mb-1" style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>{a.icon} {appTitle(a, lang)}</button>
              ); })}
            </div>
          </div>
          <div className="p-2 term text-base" style={{ background: C.bg, ...sunken, color: C.cyan }}>
            <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>SYSTEMS</div>
            {[
              ...(jLine ? [jLine] : []),
              ...(settings?.systems ?? [
                { label: "NipponOS", value: "OK", color: "green" },
                { label: "Kamera", value: "OK", color: "green" },
                { label: "Magen", value: "VOLL", color: "ochre" },
                { label: "Heimweh", value: "12%", color: "pink" },
              ]),
            ].map((s: SysLine, i: number) => (
              <div key={i}>{s.label} {"·".repeat(Math.max(2, 11 - s.label.length))} <span style={{ color: sysColor[s.color ?? "green"] ?? "#33ff66" }}>{s.value}</span></div>
            ))}
          </div>
          <div className="p-2 text-center" style={{ background: C.ink, ...raised }}>
            <div className="pixel text-[8px] mb-1" style={{ color: C.cream }}>VISITORS</div>
            <span className="term text-xl px-2" style={{ background: "#000", color: "#33ff66", letterSpacing: "2px" }}>{String(visitors).padStart(6, "0")}</span>
          </div>
          {/* Info / Umschalter */}
          {onSwitchSimple && (
            <div className="p-2 term text-base" style={{ background: C.bg, ...sunken, color: C.cream }}>
              <div className="pixel text-[8px] mb-1" style={{ color: C.cyan }}>ℹ INFO</div>
              <p className="mb-1" style={{ color: C.cream }}>{L("Das ist die verspielte Version von Nippon Diary.", "This is the playful version of Nippon Diary.")}</p>
              <button onClick={() => { click(); onSwitchSimple(); }} className="nb term text-base" style={{ color: C.pink }}>{L("→ zur normalen Seite", "→ to the normal site")}</button>
            </div>
          )}
        </aside>

        <div id="neko-area" className="flex-1 relative overflow-hidden">
          {/* Desktop Icons */}
          <div className="absolute top-2 left-2 z-[2] flex flex-col gap-1.5">
            {DESKTOP_ICONS.map(id => {
              const m = winMeta(id, data, lang);
              return (
                <button key={id} onDoubleClick={() => openApp(id)} onClick={() => { if (isMobile()) openApp(id); }}
                  className="flex flex-col items-center w-16 p-1 rounded-lg hover:bg-white/10 transition-colors" title={L("Doppelklick", "Double-click")}>
                  <span className="text-3xl">{m.icon}</span>
                  <span className="term text-sm text-center leading-none" style={{ color: C.cream, textShadow: "0 1px 2px #000" }}>{m.title}</span>
                </button>
              );
            })}
          </div>

          {/* Cat */}
          <button ref={catRef} onClick={() => click(990)} className="absolute top-0 left-0 text-3xl z-[5]" style={{ cursor: cursorUrl, willChange: "transform" }} title="にゃ～">🐱</button>

          {wins.filter(w => !w.min).map(w => (
            <WindowFrame key={w.id} win={w} data={data} settings={settings} onOpenPost={openPost}
              onClose={() => { click(440); closeWin(w.id); }} onFocus={() => focusWin(w.id)}
              onMin={() => { click(440); minWin(w.id); }} onMax={() => { click(); maxWin(w.id); }}
              onTitleDown={(e) => onTitleDown(e, w.id)} onBeep={click} />
          ))}
        </div>
      </div>

      {startOpen && (
        <>
          <div className="fixed inset-0 z-[25]" onClick={() => { setStartOpen(false); setProgOpen(false); }} />
          <div className="absolute bottom-11 left-2 z-30 p-1 w-52" style={{ background: C.pink, ...raised }}>
            <div className="p-2 relative" style={{ background: C.bg2 }}>
              <div className="pixel text-[8px] mb-2 text-center" style={{ color: C.cyan }}>★ NIPPON OS ★</div>
              {START_TOP.map(id => { const a = APPS.find(x => x.id === id)!; return (
                <button key={a.id} onClick={() => openApp(a.id)} className="nb term text-lg w-full text-left px-2 py-1 mb-0.5" style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>{a.icon} {appTitle(a, lang)}</button>
              ); })}
              {/* Programme-Ordner (klappt seitlich aus, wie Windows) */}
              <button onMouseEnter={() => setProgOpen(true)} onClick={() => { click(); setProgOpen(o => !o); }}
                className="nb term text-lg w-full text-left px-2 py-1 mb-0.5 flex items-center justify-between" style={{ color: C.ochre, ...sunken, background: progOpen ? "rgba(232,161,58,0.18)" : "rgba(255,255,255,0.05)" }}>
                <span>📁 {L("Programme", "Programs")}</span><span>▸</span>
              </button>
              {progOpen && (
                <div onMouseLeave={() => setProgOpen(false)} className="absolute left-full top-0 ml-1 p-1 w-44 z-40" style={{ background: C.pink, ...raised }}>
                  <div className="p-2" style={{ background: C.bg2 }}>
                    <div className="pixel text-[8px] mb-2 text-center" style={{ color: C.ochre }}>📁 {L("Programme", "Programs")}</div>
                    {START_PROGRAMS.map(id => { const a = APPS.find(x => x.id === id)!; return (
                      <button key={a.id} onClick={() => { openApp(a.id); setProgOpen(false); }} className="nb term text-lg w-full text-left px-2 py-1 mb-0.5" style={{ color: C.cream, ...sunken, background: "rgba(255,255,255,0.05)" }}>{a.icon} {appTitle(a, lang)}</button>
                    ); })}
                  </div>
                </div>
              )}
              <div className="mt-1 pt-1" style={{ borderTop: `1px solid ${C.ink}` }}>
                {onSwitchSimple && (
                  <button onClick={() => { click(); onSwitchSimple(); }} className="nb term text-lg w-full text-left px-2 py-1" style={{ color: C.cyan, ...sunken }}>📄 {L("Einfache Ansicht", "Simple view")}</button>
                )}
                <button onClick={shutdown} className="nb term text-lg w-full text-left px-2 py-1 mt-0.5" style={{ color: C.ochre, ...sunken }}>⏻ {L("Herunterfahren", "Shut down")}</button>
                {!onSwitchSimple && <Link href="/" className="block term text-base w-full text-left px-2 py-1 mt-0.5 nl">🌐 {L("zur echten Website", "to the real website")}</Link>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ko-fi "Banner-Ad" Popup */}
      {kofiOpen && (
        <div className="absolute bottom-12 right-2 z-40 p-1 w-64" style={{ background: C.ochre, ...raised, animation: "wo .25s ease-out" }}>
          <div className="flex items-center justify-between px-2 py-0.5" style={{ background: C.ink }}>
            <span className="term text-base" style={{ color: C.cream }}>☕ {L("Werbung?!", "Sponsored?!")}</span>
            <button onClick={() => { click(440); setKofiOpen(false); }} className="term text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.cream, color: C.ink }} title={L("Schließen", "Close")}>✕</button>
          </div>
          <div className="p-3 text-center" style={{ background: C.cream, color: C.ink }}>
            <div className="text-4xl mb-1" style={{ animation: "nf 2s ease-in-out infinite" }}>☕</div>
            <div className="pixel text-[9px] mb-2" style={{ color: C.pink }}>{L("MAGST DU NIPPONOS?", "ENJOYING NIPPONOS?")}</div>
            <p className="term text-lg leading-tight mb-3" style={{ color: C.ink }}>
              {L("Gefällt dir mein kleines Eck im Netz? Dann spendier mir einen Kaffee… oder ein Bier! 🍺 Du unterstützt damit mein Japan-Abenteuer. ♥", "Enjoying my little corner of the web? Then buy me a coffee… or a beer! 🍺 You'll support my Japan adventure. ♥")}
            </p>
            <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" onClick={() => click(880)}
              className="nb inline-block pixel text-[9px] px-4 py-2" style={{ background: C.pink, color: C.cream, ...raised, textDecoration: "none" }}>
              ★ {L("AUF KO-FI", "ON KO-FI")} ★
            </a>
          </div>
        </div>
      )}

      <div className="shrink-0 h-10 flex items-center gap-2 px-2 relative z-30" style={{ background: C.bg2, borderTop: `3px solid ${C.ink}` }}>
        <button onClick={() => { click(); setStartOpen(s => !s); setProgOpen(false); }} className="pixel text-[9px] px-2 py-1" style={{ background: startOpen ? C.cyan : C.pink, color: C.cream, ...raised }}>🗾 START</button>
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {wins.map(w => { const m = winMeta(w.id, data, lang); return (
            <button key={w.id} onClick={() => taskClick(w.id)} className="term text-base px-2 whitespace-nowrap max-w-40 truncate" style={{ color: w.min ? "#999" : C.cream, ...sunken, background: w.min ? "transparent" : "rgba(255,255,255,0.08)" }}>{m.icon} {m.title}</button>
          ); })}
        </div>
        <button onClick={() => setSound(s => !s)} className="term text-base px-2" style={{ color: sound ? C.cyan : "#888", ...sunken }} title="Sound an/aus">{sound ? "🔊" : "🔇"}</button>
        <button onClick={() => { click(520); toggleLang(); }} className="term text-base px-2" style={{ color: C.ochre, ...sunken }} title={lang === "de" ? "Switch to English" : "Auf Deutsch wechseln"}>{lang === "de" ? "DE" : "EN"}</button>
        <button onClick={() => { click(740); setKofiOpen(o => !o); }} className="term text-base px-2 whitespace-nowrap" style={{ color: kofiOpen ? C.cyan : C.pink, ...(kofiOpen ? raised : sunken) }} title={L("Support me ☕", "Support me ☕")}>☕ <span className="hidden sm:inline">support me</span></button>
        <span className="term text-lg px-2 hidden sm:inline" style={{ color: C.cyan }}>🇯🇵 {clock}</span>
      </div>
    </div>
  );
}

function WindowFrame({ win, data, settings, onOpenPost, onClose, onFocus, onMin, onMax, onTitleDown, onBeep }: {
  win: OpenWin; data: LabPost[]; settings: NipponSettings | null; onOpenPost: (id: string) => void; onClose: () => void; onFocus: () => void; onMin: () => void; onMax: () => void; onTitleDown: (e: React.PointerEvent) => void; onBeep: (f?: number) => void;
}) {
  const { lang } = useLanguage();
  const m = winMeta(win.id, data, lang);
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
        {win.id === "japanisch" && <JapanischApp onBeep={onBeep} />}
        {win.id === "photo" && <PhotoApp data={data} settings={settings} />}
        {win.id === "video" && <VideoApp data={data} settings={settings} />}
        {win.id === "map" && <MapApp data={data} onOpenPost={onOpenPost} />}
        {win.id === "bucket" && <BucketApp onBeep={onBeep} />}
        {win.id === "paint" && <PaintApp />}
        {win.id === "snake" && <SnakeApp />}
        {win.id === "pong" && <PongApp />}
        {win.id === "newsletter" && <NewsletterApp onBeep={onBeep} />}
        {win.id === "about" && <AboutApp />}
        {win.id === "guestbook" && <GuestbookApp onBeep={onBeep} />}
        {win.id.startsWith("post:") && <PostDetailApp post={data.find(p => p._id === win.id.slice(5))} />}
      </div>
    </div>
  );
}

// ─── Apps ─────────────────────────────────────────────────────────────────────
function BlogApp({ data, onOpenPost, onBeep }: { data: LabPost[]; onOpenPost: (id: string) => void; onBeep: (f?: number) => void }) {
  const { lang } = useLanguage();
  const ex = (p: LabPost) => (lang === "en" ? p.excerptEN || p.excerpt : p.excerpt) ?? "";
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const allTags = Array.from(new Set(data.flatMap(p => p.tags ?? [])));
  const filtered = data.filter(p => {
    if (tag && !(p.tags ?? []).includes(tag)) return false;
    if (q && !`${p.title} ${ex(p)} ${p.location}`.toLowerCase().includes(q.toLowerCase())) return false;
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
            <div className="w-14 h-14 shrink-0 flex items-center justify-center" style={{ background: (p.coverImage ?? p.cover) ? "transparent" : `linear-gradient(135deg,${C.pink},${C.cyan})` }}>
              {(p.coverImage ?? p.cover)
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.coverImage ?? p.cover} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">📄</span>}
            </div>
            <div className="min-w-0">
              <div className="term text-lg truncate" style={{ color: C.pink }}>{p.title}</div>
              <div className="term text-sm" style={{ color: C.ochre }}>{p.date ? new Date(p.date).toLocaleDateString("de-DE") : ""} · 📍 {p.location ?? "Japan"}</div>
              <div className="text-xs truncate" style={{ color: C.ink }}>{ex(p)}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="term text-xl text-center py-4" style={{ color: C.ochre }}>{data.length === 0 ? "noch keine Posts — leg im Studio welche an ✍" : "nichts gefunden ◔_◔"}</div>}
      </div>
    </div>
  );
}

function PostDetailApp({ post }: { post?: LabPost }) {
  const { lang } = useLanguage();
  const [zoom, setZoom] = useState<Photo | null>(null);
  if (!post) return <div className="term text-xl">{lang === "en" ? "Post not found." : "Post nicht gefunden."}</div>;
  const photos = (post.photos ?? []).filter(p => p.url);
  const text = (lang === "en" ? post.excerptEN || post.excerpt : post.excerpt) ?? "";
  return (
    <div>
      <div className="term text-2xl mb-1" style={{ color: C.pink }}>{post.title}</div>
      <div className="term text-base mb-3" style={{ color: C.ochre }}>{post.date ? new Date(post.date).toLocaleDateString(lang === "en" ? "en-US" : "de-DE", { day: "numeric", month: "long", year: "numeric" }) : ""} · 📍 {post.location ?? "Japan"}</div>
      {/* Foto */}
      <div className="p-1 mb-3" style={{ background: C.bg, ...sunken }}>
        {photos[0]?.url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photos[0].url} alt="" onClick={() => setZoom(photos[0])} className="w-full max-h-64 object-cover cursor-pointer" title={lang === "en" ? "Click to enlarge" : "Klick zum Vergrößern"} />
          : <div className="w-full h-44 flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg,${C.pink},${C.cyan})` }}>📷</div>}
      </div>
      <p className="text-sm leading-relaxed mb-3">{text}</p>
      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-1 mb-3">
          {photos.slice(1).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p.url} alt="" onClick={() => setZoom(p)} className="w-full h-16 object-cover cursor-pointer" style={{ ...sunken }} title={lang === "en" ? "Click to enlarge" : "Klick zum Vergrößern"} />
          ))}
        </div>
      )}
      {post.lat && post.lng && (
        <div className="p-1" style={{ background: C.bg, ...sunken }}>
          <MiniMap markers={[{ lat: post.lat, lng: post.lng, label: post.location ?? post.title }]} height="180px" zoom={11} />
        </div>
      )}
      <PostComments postId={post._id} postTitle={post.title} />
      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 flex items-center justify-center p-6 cursor-pointer" style={{ background: "rgba(10,10,20,0.85)", zIndex: 99999 }}>
          <div className="p-2 max-w-3xl" style={{ background: C.cream, ...raised }} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom.url} alt="" className="w-full max-h-[75vh] object-contain" />
            {zoom.caption && <div className="term text-base mt-1 text-center" style={{ color: C.ink }}>{zoom.caption}</div>}
            <button onClick={() => setZoom(null)} className="term text-base mt-2 w-full px-2 py-1" style={{ background: C.pink, color: C.cream, ...raised }}>✕ {lang === "en" ? "Close" : "Schließen"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostComments({ postId, postTitle }: { postId: string; postTitle: string }) {
  interface Comment { _id?: string; name: string; message: string; createdAt?: string }
  const { lang } = useLanguage();
  const L = (de: string, en: string) => (lang === "en" ? en : de);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState(""); const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false); const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`).then(r => r.json()).then(d => setComments(Array.isArray(d) ? d : [])).catch(() => {});
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim() || !msg.trim()) return; setSending(true);
    try {
      const res = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId, postTitle, name, message: msg }) });
      if (res.ok) { setSent(true); setName(""); setMsg(""); }
    } catch {}
    setSending(false);
  }

  return (
    <div className="mt-4 pt-3" style={{ borderTop: `2px dashed ${C.ochre}` }}>
      <div className="pixel text-[9px] mb-2" style={{ color: C.pink }}>💬 {L("KOMMENTARE", "COMMENTS")} ({comments.length})</div>
      <div className="flex flex-col gap-1.5 mb-3">
        {comments.length === 0
          ? <div className="term text-base" style={{ color: C.ochre }}>{L("Noch keine Kommentare — schreib den ersten! ✍", "No comments yet — write the first! ✍")}</div>
          : comments.map((c, i) => (
            <div key={c._id ?? i} className="p-2 term text-base" style={{ ...sunken, background: "#fff" }}>
              <span style={{ color: C.pink }}>{c.name}:</span> <span style={{ color: C.ink }}>{c.message}</span>
            </div>
          ))}
      </div>
      {sent ? (
        <div className="p-2 term text-base text-center" style={{ ...sunken, background: "#fff", color: C.ink }}>
          {L("✅ Danke! Dein Kommentar wird kurz geprüft. ♥", "✅ Thanks! Your comment will be reviewed shortly. ♥")}
          <button onClick={() => setSent(false)} className="block nb term text-base mt-1 nl mx-auto">{L("noch einen schreiben", "write another")}</button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-1.5">
          <input value={name} onChange={e => setName(e.target.value)} placeholder={L("Dein Name", "Your name")} className="term text-base px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder={L("Dein Kommentar…", "Your comment…")} rows={2} className="term text-base px-2 py-1 resize-none outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
          <button type="submit" disabled={sending} className="nb term text-base px-3 py-1 self-end disabled:opacity-50" style={{ background: C.pink, color: C.cream, ...raised }}>{sending ? "…" : L("💬 kommentieren", "💬 comment")}</button>
        </form>
      )}
    </div>
  );
}

function PhotoApp({ data, settings }: { data: LabPost[]; settings: NipponSettings | null }) {
  const { lang } = useLanguage();
  // Im Studio gesetztes Foto des Tages hat Vorrang, sonst zufälliges Post-Foto
  const photos = data.flatMap(p => (p.photos ?? []).filter(x => x.url).map(x => ({ ...x, post: p })));
  const auto = photos.length ? photos[Math.floor(Date.now() / 86400000) % photos.length] : null;
  const url = settings?.photoOfDay?.url ?? auto?.url;
  const caption = settings?.photoOfDay?.caption ?? auto?.caption ?? auto?.post?.location;
  return (
    <div className="text-center">
      <div className="pixel text-[10px] mb-2" style={{ color: C.pink }}>{lang === "en" ? "★ PHOTO OF THE DAY ★" : "★ FOTO DES TAGES ★"}</div>
      <div className="p-1 inline-block w-full" style={{ background: C.bg, ...sunken }}>
        {url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={url} alt="" className="w-full max-h-80 object-cover" />
          : <div className="w-full h-56 flex items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg,${C.pink},${C.cyan})` }}>📷</div>}
      </div>
      <div className="term text-lg mt-2" style={{ color: C.ochre }}>{caption ?? (lang === "en" ? "No photos yet — add some in the Studio 📷" : "Noch keine Fotos — leg im Studio welche an 📷")}</div>
    </div>
  );
}
function VideoApp({ data, settings }: { data: LabPost[]; settings: NipponSettings | null }) {
  const { lang } = useLanguage();
  // Im Studio gesetztes Video des Tages hat Vorrang, sonst erstes Post-Video
  const fromPost = data.find(p => p.youtubeId);
  const vidId = settings?.videoOfDay?.id ?? fromPost?.youtubeId;
  const vidTitle = settings?.videoOfDay?.title ?? fromPost?.title;
  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>{lang === "en" ? "▶ VIDEO OF THE DAY ▶" : "▶ VIDEO DES TAGES ▶"}</div>
      {vidId ? (
        <>
          <div className="relative" style={{ paddingBottom: "56.25%" }}>
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${vidId}`} title="Video" allowFullScreen />
          </div>
          {vidTitle && <div className="term text-lg mt-2 text-center" style={{ color: C.ochre }}>{vidTitle}</div>}
        </>
      ) : (
        <div className="term text-xl text-center py-8" style={{ color: C.ochre }}>{lang === "en" ? "no video yet — set a YouTube link in the Studio 🎬" : "noch kein Video — setz im Studio einen YouTube-Link 🎬"}</div>
      )}
    </div>
  );
}
function MapApp({ data, onOpenPost }: { data: LabPost[]; onOpenPost: (id: string) => void }) {
  const { lang } = useLanguage();
  const markers = data.filter(p => p.lat && p.lng).map(p => ({ lat: p.lat!, lng: p.lng!, label: p.location ?? p.title, id: p._id }));
  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>{lang === "en" ? "🗺 MY PLACES 🗺" : "🗺 MEINE ORTE 🗺"}</div>
      <div className="p-1" style={{ background: C.bg, ...sunken }}>
        {markers.length ? <MiniMap markers={markers} height="300px" zoom={6} onMarkerClick={(id) => onOpenPost(id)} /> : <div className="h-40 flex items-center justify-center term text-xl" style={{ color: C.cyan }}>{lang === "en" ? "no places yet ◔_◔" : "noch keine Orte ◔_◔"}</div>}
      </div>
    </div>
  );
}
function AboutApp() {
  return (
    <div className="term text-xl leading-snug">
      <div className="pixel text-[10px] mb-3" style={{ color: C.pink }}>★ ÜBER MICH ★</div>
      <p>こんにちは！ Ich bin David 🙋</p>
      <p className="mt-2">Ich sammle hier Momente — Fotos, Ramen-Funde, kleine Entdeckungen.</p>
      <p className="mt-2" style={{ color: C.pink }}>Lieblings-Konbini: 7-Eleven 🍙</p>
      <p style={{ color: C.ochre }}>Aktueller Skill: Stäbchen-Profi 🥢</p>
      <p className="mt-2">Dieses NipponOS ist mein kleines Eck im Netz. Bleib eine Weile! (-‿‿-)</p>
    </div>
  );
}
function GuestbookApp({ onBeep }: { onBeep: (f?: number) => void }) {
  interface Reply { _key?: string; name: string; message: string }
  interface Entry { _id?: string; name: string; message: string; antworten?: Reply[] }
  const { lang } = useLanguage();
  const L = (de: string, en: string) => (lang === "en" ? en : de);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState(""); const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false); const [sending, setSending] = useState(false);
  // Antwort-Status pro Eintrag
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [rName, setRName] = useState(""); const [rMsg, setRMsg] = useState("");
  const [rSending, setRSending] = useState(false); const [rSentId, setRSentId] = useState<string | null>(null);

  useEffect(() => { fetch("/api/guestbook").then(r => r.json()).then(d => setEntries(Array.isArray(d) ? d : [])).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim() || !msg.trim()) return; onBeep(880); setSending(true);
    try {
      const res = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, message: msg }) });
      if (res.ok) { setSent(true); setName(""); setMsg(""); }
    } catch {}
    setSending(false);
  }

  async function submitReply(e: React.FormEvent, entryId?: string) {
    e.preventDefault(); if (!entryId || !rName.trim() || !rMsg.trim()) return; onBeep(880); setRSending(true);
    try {
      const res = await fetch("/api/guestbook/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId, name: rName, message: rMsg }) });
      if (res.ok) { setRSentId(entryId); setReplyTo(null); setRName(""); setRMsg(""); }
    } catch {}
    setRSending(false);
  }

  return (
    <div>
      <div className="pixel text-[10px] mb-3 text-center" style={{ color: C.pink }}>{L("✉ GÄSTEBUCH ✉", "✉ GUESTBOOK ✉")}</div>
      {sent ? (
        <div className="p-3 term text-xl text-center mb-3" style={{ ...sunken, background: "#fff", color: C.ink }}>
          {L("✅ Danke! Dein Eintrag wird kurz geprüft und erscheint dann hier. ♥", "✅ Thanks! Your entry will be checked and shown here shortly. ♥")}
          <button onClick={() => setSent(false)} className="block nb term text-lg mt-2 nl mx-auto">{L("noch einen schreiben", "write another")}</button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2 mb-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder={L("Dein Name", "Your name")} className="term text-lg px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder={L("Deine Nachricht…", "Your message…")} rows={2} className="term text-lg px-2 py-1 resize-none outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
          <button type="submit" disabled={sending} className="nb pixel text-[9px] px-3 py-2 self-end disabled:opacity-50" style={{ background: C.pink, color: C.cream, ...raised }}>{sending ? "…" : L("★ EINTRAGEN ★", "★ POST ★")}</button>
        </form>
      )}
      <div className="flex flex-col gap-2">
        {entries.length === 0
          ? <div className="term text-lg text-center" style={{ color: C.ochre }}>{L("Sei der Erste! ✍", "Be the first! ✍")}</div>
          : entries.map((e, i) => (
            <div key={e._id ?? i} className="p-2 term text-lg" style={{ ...sunken, background: "#fff" }}>
              <div><span style={{ color: C.pink }}>{e.name}:</span> <span style={{ color: C.ink }}>{e.message}</span></div>
              {/* Antworten */}
              {(e.antworten ?? []).length > 0 && (
                <div className="mt-1.5 ml-3 pl-2 flex flex-col gap-1" style={{ borderLeft: `3px solid ${C.cyan}` }}>
                  {(e.antworten ?? []).map((a, j) => (
                    <div key={a._key ?? j} className="term text-base"><span style={{ color: C.cyan }}>↳ {a.name}:</span> <span style={{ color: C.ink }}>{a.message}</span></div>
                  ))}
                </div>
              )}
              {/* Antwort-Aktion */}
              {rSentId === e._id ? (
                <div className="term text-base mt-1" style={{ color: C.ochre }}>{L("✅ Antwort wird geprüft ♥", "✅ Reply is being reviewed ♥")}</div>
              ) : replyTo === e._id ? (
                <form onSubmit={(ev) => submitReply(ev, e._id)} className="flex flex-col gap-1 mt-1.5">
                  <input value={rName} onChange={ev => setRName(ev.target.value)} placeholder={L("Dein Name", "Your name")} className="term text-base px-2 py-0.5 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
                  <textarea value={rMsg} onChange={ev => setRMsg(ev.target.value)} placeholder={L("Deine Antwort…", "Your reply…")} rows={2} className="term text-base px-2 py-0.5 resize-none outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
                  <div className="flex gap-1 self-end">
                    <button type="button" onClick={() => { onBeep(440); setReplyTo(null); }} className="nb term text-base px-2" style={{ ...sunken, background: "#fff", color: C.ink }}>{L("abbrechen", "cancel")}</button>
                    <button type="submit" disabled={rSending} className="nb term text-base px-3 disabled:opacity-50" style={{ background: C.cyan, color: C.ink, ...raised }}>{rSending ? "…" : L("↳ antworten", "↳ reply")}</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => { onBeep(); setReplyTo(e._id ?? null); setRName(""); setRMsg(""); }} className="nb term text-base mt-1" style={{ color: C.cyan }}>↳ {L("antworten", "reply")}</button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Highscore-Rangliste (Snake & Pong) ──────────────────────────────────────
function GameScores({ game, score, over }: { game: string; score: number; over: boolean }) {
  interface S { _id?: string; name: string; score: number }
  const { lang } = useLanguage();
  const L = (de: string, en: string) => (lang === "en" ? en : de);
  const [list, setList] = useState<S[]>([]);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = () => fetch(`/api/highscores?game=${game}`).then(r => r.json()).then(d => setList(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [game]);
  // Neue Runde → wieder speichern erlauben
  useEffect(() => { if (!over) setSubmitted(false); }, [over]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim() || saving) return; setSaving(true);
    try {
      await fetch("/api/highscores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game, name, score }) });
      setSubmitted(true); await load();
    } catch {}
    setSaving(false);
  }

  const qualifies = over && score > 0 && !submitted;
  return (
    <div className="mt-3 max-w-xs mx-auto">
      {qualifies && (
        <form onSubmit={save} className="flex gap-1 mb-2 justify-center">
          <input value={name} onChange={e => setName(e.target.value)} maxLength={16} autoFocus placeholder={L("Dein Name", "Your name")}
            className="term text-base px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink, width: 130 }} />
          <button type="submit" disabled={saving} className="nb term text-base px-2 disabled:opacity-50" style={{ background: C.cyan, color: C.ink, ...raised }}>{saving ? "…" : L("↵ speichern", "↵ save")}</button>
        </form>
      )}
      {submitted && over && <div className="term text-base text-center mb-1" style={{ color: C.cyan }}>{L("✅ gespeichert!", "✅ saved!")}</div>}
      <div className="pixel text-[8px] mb-1 text-center" style={{ color: C.ochre }}>🏆 {L("RANGLISTE", "LEADERBOARD")}</div>
      <div className="flex flex-col gap-0.5">
        {list.length === 0
          ? <div className="term text-base text-center" style={{ color: C.ochre }}>{L("noch keine Scores", "no scores yet")}</div>
          : list.map((s, i) => (
            <div key={s._id ?? i} className="term text-base flex justify-between px-2 py-0.5" style={{ ...sunken, background: "#fff", color: C.ink }}>
              <span>{i + 1}. {i === 0 ? "👑 " : ""}{s.name}</span><span style={{ color: C.pink }}>{s.score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Paint ────────────────────────────────────────────────────────────────────
function PaintApp() {
  interface Drawing { _id?: string; name?: string; url: string }
  const { lang } = useLanguage();
  const L = (de: string, en: string) => (lang === "en" ? en : de);
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(C.pink);
  const [size, setSize] = useState(5);
  const [view, setView] = useState<"draw" | "gallery">("draw");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [gallery, setGallery] = useState<Drawing[]>([]);
  const draw = useRef(false);
  const colors = [C.pink, C.cyan, C.ochre, C.ink, "#33ff66", "#ffffff"];
  function clear() { const c = ref.current?.getContext("2d"); if (!c || !ref.current) return; c.fillStyle = "#fff"; c.fillRect(0, 0, ref.current.width, ref.current.height); }
  useEffect(() => { if (view === "draw") clear(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [view]);
  function loadGallery() { fetch("/api/drawings").then(r => r.json()).then(d => setGallery(Array.isArray(d) ? d : [])).catch(() => {}); }
  useEffect(() => { if (view === "gallery") loadGallery(); }, [view]);
  function pos(e: React.PointerEvent) { const r = ref.current!.getBoundingClientRect(); return { x: (e.clientX - r.left) * (ref.current!.width / r.width), y: (e.clientY - r.top) * (ref.current!.height / r.height) }; }
  function down(e: React.PointerEvent) { draw.current = true; const c = ref.current!.getContext("2d")!; const p = pos(e); c.beginPath(); c.moveTo(p.x, p.y); }
  function move(e: React.PointerEvent) { if (!draw.current) return; const c = ref.current!.getContext("2d")!; const p = pos(e); c.lineTo(p.x, p.y); c.strokeStyle = color; c.lineWidth = size; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(); }

  async function save() {
    if (!ref.current || saving) return; setSaving(true);
    try {
      const dataUrl = ref.current.toDataURL("image/png");
      const res = await fetch("/api/drawings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, dataUrl }) });
      if (res.ok) { setSaved(true); setShowSave(false); setName(""); }
    } catch {}
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="pixel text-[10px]" style={{ color: C.pink }}>🎨 PAINT 🎨</div>
        <div className="flex gap-1">
          <button onClick={() => setView("draw")} className="term text-base px-2" style={{ ...(view === "draw" ? raised : sunken), background: view === "draw" ? C.pink : "#fff", color: view === "draw" ? C.cream : C.ink }}>✏ {L("Malen", "Draw")}</button>
          <button onClick={() => setView("gallery")} className="term text-base px-2" style={{ ...(view === "gallery" ? raised : sunken), background: view === "gallery" ? C.pink : "#fff", color: view === "gallery" ? C.cream : C.ink }}>🖼 {L("Galerie", "Gallery")}</button>
        </div>
      </div>

      {view === "draw" ? (
        <>
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {colors.map(c => <button key={c} onClick={() => setColor(c)} className="w-6 h-6" style={{ background: c, ...(color === c ? raised : sunken) }} />)}
            <span className="term text-base ml-2" style={{ color: C.ink }}>{L("Größe", "Size")}:</span>
            {[2, 5, 12].map(s => <button key={s} onClick={() => setSize(s)} className="term text-base px-2" style={{ ...(size === s ? raised : sunken), background: size === s ? C.pink : "#fff", color: size === s ? C.cream : C.ink }}>{s}</button>)}
            <button onClick={clear} className="term text-base px-2 ml-auto" style={{ ...sunken, background: "#fff", color: C.ink }}>🗑 {L("leeren", "clear")}</button>
          </div>
          <canvas ref={ref} width={460} height={300} className="w-full touch-none" style={{ ...sunken, background: "#fff", cursor: "crosshair" }}
            onPointerDown={down} onPointerMove={move} onPointerUp={() => draw.current = false} onPointerLeave={() => draw.current = false} />
          {saved ? (
            <div className="term text-base text-center mt-2" style={{ color: C.cyan }}>
              {L("✅ Danke! Deine Zeichnung wird kurz geprüft und erscheint dann in der Galerie. ♥", "✅ Thanks! Your drawing will be reviewed and then appear in the gallery. ♥")}
              <button onClick={() => setSaved(false)} className="block nb term text-base mt-1 nl mx-auto">{L("weiter malen", "keep drawing")}</button>
            </div>
          ) : showSave ? (
            <div className="flex gap-1 mt-2">
              <input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder={L("Dein Name", "Your name")} className="term text-base px-2 py-1 flex-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
              <button onClick={() => setShowSave(false)} className="nb term text-base px-2" style={{ ...sunken, background: "#fff", color: C.ink }}>{L("abbrechen", "cancel")}</button>
              <button onClick={save} disabled={saving} className="nb term text-base px-3 disabled:opacity-50" style={{ background: C.cyan, color: C.ink, ...raised }}>{saving ? "…" : L("💾 hochladen", "💾 upload")}</button>
            </div>
          ) : (
            <button onClick={() => setShowSave(true)} className="nb term text-base px-3 py-1 mt-2 w-full" style={{ background: C.pink, color: C.cream, ...raised }}>💾 {L("Zeichnung speichern", "Save drawing")}</button>
          )}
        </>
      ) : (
        <div>
          {gallery.length === 0
            ? <div className="term text-lg text-center py-6" style={{ color: C.ochre }}>{L("Noch keine Zeichnungen — mal die erste! 🎨", "No drawings yet — draw the first! 🎨")}</div>
            : <div className="grid grid-cols-2 gap-2">
                {gallery.map((d, i) => (
                  <div key={d._id ?? i} className="p-1" style={{ ...sunken, background: "#fff" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.url} alt="" className="w-full object-contain" style={{ background: "#fff" }} />
                    <div className="term text-base text-center" style={{ color: C.ink }}>{L("von", "by")} <span style={{ color: C.pink }}>{d.name || "Anonym"}</span></div>
                  </div>
                ))}
              </div>}
        </div>
      )}
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
      // Tastatur ignorieren, wenn in ein Eingabefeld getippt wird (Name speichern)
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
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
      <GameScores game="snake" score={score} over={over} />
    </div>
  );
}

// ─── Schön formatiertes Markdown (für Japanisch-Inhalte) ──────────────────────
function NipponMarkdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed mt-1" style={{ color: C.ink }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h1: (p) => <h2 className="text-lg font-bold mt-3 mb-1" style={{ color: C.pink }} {...p} />,
        h2: (p) => <h3 className="text-base font-bold mt-3 mb-1 pb-0.5" style={{ color: C.pink, borderBottom: `2px solid ${C.ochre}` }} {...p} />,
        h3: (p) => <h4 className="text-sm font-bold mt-2 mb-1" style={{ color: C.ochre }} {...p} />,
        p: (p) => <p className="mb-2" {...p} />,
        strong: (p) => <strong className="font-bold" style={{ color: C.pink }} {...p} />,
        em: (p) => <em className="italic" {...p} />,
        ul: (p) => <ul className="list-disc list-inside mb-2 space-y-0.5" {...p} />,
        ol: (p) => <ol className="list-decimal list-inside mb-2 space-y-0.5" {...p} />,
        blockquote: (p) => <blockquote className="pl-2 my-2 italic" style={{ borderLeft: `3px solid ${C.cyan}`, color: "#555" }} {...p} />,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ({ children, ...p }: any) => <code className="px-1 rounded text-xs font-mono" style={{ background: C.bg, color: C.cyan }} {...p}>{children}</code>,
        table: (p) => <div className="overflow-x-auto my-2"><table className="border-collapse text-xs w-full" {...p} /></div>,
        th: (p) => <th className="border px-1.5 py-1 text-left font-bold" style={{ borderColor: "#ccc", background: `${C.ochre}33`, color: C.ink }} {...p} />,
        td: (p) => <td className="border px-1.5 py-1 align-top" style={{ borderColor: "#ddd" }} {...p} />,
        a: (p) => <a className="underline" style={{ color: C.pink }} {...p} />,
        hr: () => <hr className="my-2" style={{ borderColor: "#ddd" }} />,
      }}>{content}</ReactMarkdown>
    </div>
  );
}

// ─── Japanisch (live aus Studio) ──────────────────────────────────────────────
function JapanischApp({ onBeep }: { onBeep: (f?: number) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("notizen");
  const [q, setQ] = useState("");
  const [jlpt, setJlpt] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { fetch("/api/japanisch").then(r => r.json()).then(setData).catch(() => {}); }, []);
  const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

  const TABS: [string, string][] = [
    ["notizen", "📚 Lektionen"], ["lessons", "✨ Nützliches"], ["grammatik", "🔤 Grammatik"],
    ["partikel", "🔗 Partikel"], ["saetze", "💬 Sätze"], ["vokabeln", "📝 Vokabeln"], ["kanji", "漢 Kanji"],
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function head(it: any): string { return it.titel ?? it.title ?? it.wort ?? it.zeichen ?? it.muster ?? it.partikel ?? it.japanisch ?? "?"; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function sub(it: any): string { return it.bedeutung ?? it.funktion ?? it.deutsch ?? it.description ?? ""; }

  if (!data) return <div className="term text-xl text-center py-6" style={{ color: C.ochre }}>lädt aus Studio… ⏳</div>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabItems: any[] = data[tab] ?? [];
  // JLPT-Filter nur zeigen, wenn der aktuelle Tab überhaupt JLPT-Einträge hat
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasJlpt = tabItems.some((it: any) => it.jlpt);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = tabItems.filter((it: any) =>
    (!q || `${head(it)} ${sub(it)} ${it.kana ?? ""}`.toLowerCase().includes(q.toLowerCase()))
    && (!jlpt || it.jlpt === jlpt));

  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>🎌 JAPANISCH 🎌</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => { onBeep(); setTab(id); setOpen(null); setJlpt(null); }} className="term text-base px-2" style={{ ...(tab === id ? raised : sunken), background: tab === id ? C.pink : "#fff", color: tab === id ? C.cream : C.ink }}>{label}</button>
        ))}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 suchen…" className="term text-lg w-full px-2 py-1 mb-2 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
      {hasJlpt && (
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <span className="term text-base mr-1" style={{ color: C.ochre }}>JLPT:</span>
          <button onClick={() => { onBeep(); setJlpt(null); }} className="term text-base px-2" style={{ ...(jlpt === null ? raised : sunken), background: jlpt === null ? C.cyan : "#fff", color: C.ink }}>Alle</button>
          {JLPT_LEVELS.map(lvl => (
            <button key={lvl} onClick={() => { onBeep(); setJlpt(jlpt === lvl ? null : lvl); }} className="term text-base px-2" style={{ ...(jlpt === lvl ? raised : sunken), background: jlpt === lvl ? C.ochre : "#fff", color: jlpt === lvl ? "#fff" : C.ink }}>{lvl}</button>
          ))}
        </div>
      )}
      <div className="term text-sm mb-2" style={{ color: C.ochre }}>{items.length} Einträge</div>
      <div className="flex flex-col gap-1.5">
        {items.length === 0 && <div className="term text-lg text-center py-3" style={{ color: C.ochre }}>noch nichts hier — leg im Studio Einträge an ✍</div>}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {items.map((it: any) => {
          const id = it._id;
          const isOpen = open === id;
          return (
            <div key={id} style={{ ...sunken, background: "#fff" }}>
              <button onClick={() => { onBeep(); setOpen(isOpen ? null : id); }} className="w-full text-left p-2 flex items-center gap-2">
                <span className="term text-xl" style={{ color: C.pink }}>{head(it)}</span>
                {it.kana && <span className="term text-base" style={{ color: C.cyan }}>{it.kana}</span>}
                {it.jlpt && <span className="term text-sm px-1" style={{ background: C.ochre, color: "#fff" }}>{it.jlpt}</span>}
                <span className="text-xs ml-auto truncate" style={{ color: C.ink }}>{sub(it)}</span>
              </button>
              {isOpen && (
                <div className="px-2 pb-2 text-sm" style={{ color: C.ink }}>
                  {it.struktur && <div className="term text-base mb-1 px-2 py-1" style={{ background: C.bg, color: C.cyan, ...sunken }}>{it.struktur}</div>}
                  {it.konjugation?.length > 0 && (
                    <table className="w-full mb-2"><tbody>{it.konjugation.map((k: { form: string; japanisch: string; kana?: string }, i: number) => (
                      <tr key={i}><td className="term text-sm pr-2" style={{ color: C.ochre }}>{k.form}</td><td className="term text-base">{k.japanisch}</td><td className="term text-sm" style={{ color: C.cyan }}>{k.kana}</td></tr>
                    ))}</tbody></table>
                  )}
                  {(it.beispiele ?? []).map((b: { japanisch?: string; kana?: string; deutsch?: string }, i: number) => (
                    <div key={i} className="mb-1"><span className="term text-base">{b.japanisch}</span> {b.kana && <span className="term text-sm" style={{ color: C.cyan }}>（{b.kana}）</span>} — {b.deutsch}</div>
                  ))}
                  {(it.phrases ?? []).map((p: { jp: string; romaji?: string; de: string }, i: number) => (
                    <div key={i} className="mb-1"><span className="term text-base">{p.jp}</span> {p.romaji && <span className="term text-sm" style={{ color: C.cyan }}>（{p.romaji}）</span>} — {p.de}</div>
                  ))}
                  {it.inhalt && <NipponMarkdown content={it.inhalt} />}
                  {it.markdown && <NipponMarkdown content={it.markdown} />}
                  {it.notizen && <p className="mt-1" style={{ color: C.ink }}>{it.notizen}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bucket List (live aus Studio) ────────────────────────────────────────────
function BucketApp({ onBeep }: { onBeep: (f?: number) => void }) {
  interface Item { _id: string; title: string; description?: string; location?: string; done: boolean }
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/bucket").then(r => r.json()).then((d: Item[]) => {
      let local: Record<string, boolean> = {};
      try { local = JSON.parse(localStorage.getItem("nippon-bucket") ?? "{}"); } catch {}
      setItems((Array.isArray(d) ? d : []).map(i => ({ ...i, done: local[i._id] ?? i.done })));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);
  function toggle(id: string) {
    onBeep();
    setItems(prev => {
      const next = prev.map(i => i._id === id ? { ...i, done: !i.done } : i);
      try { localStorage.setItem("nippon-bucket", JSON.stringify(Object.fromEntries(next.map(i => [i._id, i.done])))); } catch {}
      return next;
    });
  }
  const done = items.filter(i => i.done).length;
  return (
    <div>
      <div className="pixel text-[10px] mb-2 text-center" style={{ color: C.pink }}>🎯 BUCKET LIST 🎯</div>
      {!loaded ? <div className="term text-xl text-center py-4" style={{ color: C.ochre }}>lädt… ⏳</div> : items.length === 0 ? (
        <div className="term text-lg text-center py-4" style={{ color: C.ochre }}>noch keine Ziele — leg sie im Studio an 🗺</div>
      ) : (
        <>
          <div className="mb-3">
            <div className="term text-base flex justify-between" style={{ color: C.ochre }}><span>{done}/{items.length} erledigt</span><span>{Math.round((done / items.length) * 100)}%</span></div>
            <div className="h-3 p-0.5" style={{ ...sunken, background: "#fff" }}><div className="h-full" style={{ width: `${(done / items.length) * 100}%`, background: `linear-gradient(90deg,${C.cyan},${C.pink})` }} /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            {items.map(i => (
              <button key={i._id} onClick={() => toggle(i._id)} className="p-2 text-left flex items-start gap-2" style={{ ...sunken, background: "#fff", opacity: i.done ? 0.6 : 1 }}>
                <span className="term text-xl" style={{ color: i.done ? C.cyan : C.ink }}>{i.done ? "☑" : "☐"}</span>
                <div className="min-w-0">
                  <div className="term text-lg" style={{ color: C.pink, textDecoration: i.done ? "line-through" : "none" }}>{i.title}</div>
                  {i.description && <div className="text-xs" style={{ color: C.ink }}>{i.description}</div>}
                  {i.location && <div className="term text-sm" style={{ color: C.ochre }}>📍 {i.location}</div>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function NewsletterApp({ onBeep }: { onBeep: (f?: number) => void }) {
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sent, setSent] = useState(false); const [sending, setSending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!email.trim()) return; onBeep(880); setSending(true);
    try { const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name }) }); if (r.ok) setSent(true); } catch {}
    setSending(false);
  }
  return (
    <div>
      <div className="pixel text-[10px] mb-3 text-center" style={{ color: C.pink }}>📧 NEWSLETTER 📧</div>
      {sent ? (
        <div className="p-3 term text-xl text-center" style={{ ...sunken, background: "#fff", color: C.ink }}>✅ Du bist dabei! Du bekommst eine Mail bei Neuigkeiten. ♥</div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <p className="term text-lg" style={{ color: C.ink }}>Trag dich ein und ich melde mich bei neuen Posts!</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (optional)" className="term text-lg px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="deine@email.com" required className="term text-lg px-2 py-1 outline-none" style={{ ...sunken, background: "#fff", color: C.ink }} />
          <button type="submit" disabled={sending} className="nb pixel text-[9px] px-3 py-2 self-end disabled:opacity-50" style={{ background: C.pink, color: C.cream, ...raised }}>{sending ? "…" : "★ EINTRAGEN ★"}</button>
        </form>
      )}
    </div>
  );
}

// ─── Pong ─────────────────────────────────────────────────────────────────────
function PongApp() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ p: 0, a: 0 });
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const Wd = 320, Ht = 220, PH = 46, PW = 7, MAX = 7;
  const g = useRef({ bx: 160, by: 110, vx: 3.2, vy: 2.2, py: 90, ay: 90 });
  const playerY = useRef(90);

  function reset() { g.current = { bx: 160, by: 110, vx: Math.random() > 0.5 ? 3.2 : -3.2, vy: 2.2, py: 90, ay: 90 }; setScore({ p: 0, a: 0 }); setOver(false); setRunning(true); }

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowUp" || e.key === "w") { playerY.current = Math.max(0, playerY.current - 24); e.preventDefault(); }
      if (e.key === "ArrowDown" || e.key === "s") { playerY.current = Math.min(Ht - PH, playerY.current + 24); e.preventDefault(); }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const s = g.current;
      s.py += (playerY.current - s.py) * 0.4;
      // AI verfolgt Ball mit Verzögerung
      s.ay += ((s.by - PH / 2) - s.ay) * 0.08;
      s.ay = Math.max(0, Math.min(Ht - PH, s.ay));
      s.bx += s.vx; s.by += s.vy;
      if (s.by < 4 || s.by > Ht - 4) s.vy *= -1;
      // Spieler-Paddle (links)
      if (s.bx < 4 + PW && s.by > s.py && s.by < s.py + PH) { s.vx = Math.abs(s.vx) * 1.04; s.vy += (s.by - (s.py + PH / 2)) * 0.04; }
      // AI-Paddle (rechts)
      if (s.bx > Wd - 4 - PW && s.by > s.ay && s.by < s.ay + PH) { s.vx = -Math.abs(s.vx) * 1.04; s.vy += (s.by - (s.ay + PH / 2)) * 0.04; }
      // Tore
      if (s.bx < 0) { s.bx = 160; s.by = 110; s.vx = 3.2; s.vy = 2.2; setScore(sc => { const a = sc.a + 1; if (a >= MAX) { setOver(true); setRunning(false); } return { ...sc, a }; }); }
      if (s.bx > Wd) { s.bx = 160; s.by = 110; s.vx = -3.2; s.vy = 2.2; setScore(sc => { const p = sc.p + 1; if (p >= MAX) { setOver(true); setRunning(false); } return { ...sc, p }; }); }
      // zeichnen
      const c = ref.current?.getContext("2d"); if (!c) return;
      c.fillStyle = C.bg; c.fillRect(0, 0, Wd, Ht);
      c.strokeStyle = "rgba(255,255,255,0.15)"; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(Wd / 2, 0); c.lineTo(Wd / 2, Ht); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.cyan; c.fillRect(4, s.py, PW, PH);
      c.fillStyle = C.pink; c.fillRect(Wd - 4 - PW, s.ay, PW, PH);
      c.fillStyle = C.ochre; c.fillRect(s.bx - 4, s.by - 4, 8, 8);
    }, 16);
    return () => clearInterval(iv);
  }, [running]);

  function pointer(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    playerY.current = Math.max(0, Math.min(Ht - PH, (e.clientY - r.top) * (Ht / r.height) - PH / 2));
  }

  return (
    <div className="text-center">
      <div className="pixel text-[10px] mb-2" style={{ color: C.pink }}>🏓 PONG 🏓</div>
      <div className="term text-xl mb-2" style={{ color: C.ochre }}>Du <span style={{ color: C.cyan }}>{score.p}</span> : <span style={{ color: C.pink }}>{score.a}</span> CPU <span className="text-sm">(bis {MAX})</span></div>
      <div className="inline-block p-1 relative" style={{ background: C.ink, ...sunken }}>
        <canvas ref={ref} width={Wd} height={Ht} onPointerMove={pointer} className="touch-none" style={{ display: "block", imageRendering: "pixelated", maxWidth: "100%", cursor: "ns-resize" }} />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(26,26,46,0.85)" }}>
            {over && <div className="pixel text-xs" style={{ color: score.p > score.a ? C.cyan : C.pink }}>{score.p > score.a ? "YOU WIN!" : "GAME OVER"}</div>}
            <button onClick={reset} className="nb pixel text-[10px] px-3 py-2" style={{ background: C.cyan, color: C.bg, ...raised }}>{over ? "★ NOCHMAL ★" : "▶ START"}</button>
          </div>
        )}
      </div>
      <div className="term text-base mt-2" style={{ color: C.cyan }}>Maus bewegen oder ↑ ↓</div>
      <GameScores game="pong" score={score.p} over={over} />
    </div>
  );
}
