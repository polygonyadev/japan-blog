"use client";
import { useEffect, useState } from "react";
import HomeClient from "@/app/HomeClient";
import NipponDesktop from "@/app/lab/NipponDesktop";

type Mode = "loading" | "choose" | "os" | "classic";
const KEY = "nippon-exp";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[]; bucketItems: any[]; settings: any; stats: any;
}

export default function EntryGate(props: Props) {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const s = localStorage.getItem(KEY);
    setMode(s === "os" || s === "classic" ? s : "choose");
  }, []);

  function choose(m: "os" | "classic", remember = true) {
    if (remember) localStorage.setItem(KEY, m);
    setMode(m);
  }

  if (mode === "loading") {
    return <div className="fixed inset-0 z-[100]" style={{ background: "#1a1a2e" }} />;
  }

  if (mode === "choose") {
    return <Chooser onChoose={choose} />;
  }

  if (mode === "os") {
    return <NipponDesktop posts={props.posts} onSwitchSimple={() => choose("classic")} />;
  }

  return <HomeClient posts={props.posts} bucketItems={props.bucketItems} settings={props.settings} stats={props.stats} />;
}

// ─── Auswahl-Screen ───────────────────────────────────────────────────────────
function Chooser({ onChoose }: { onChoose: (m: "os" | "classic") => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #1a1040 0%, #2d1b5e 50%, #c8447a 100%)", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');.gpx{font-family:'Press Start 2P',monospace}.gtm{font-family:'VT323',monospace}@keyframes gf{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div className="text-7xl mb-4" style={{ animation: "gf 4s ease-in-out infinite" }}>🗾</div>
      <h1 className="gpx text-xl sm:text-3xl mb-2 text-center" style={{ textShadow: "3px 3px 0 #ff2a6d" }}>NIPPON DIARY</h1>
      <p className="gtm text-2xl mb-10 text-center" style={{ color: "#ffd9a0" }}>Wie möchtest du die Seite erleben?</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        {/* NipponOS */}
        <button onClick={() => onChoose("os")}
          className="flex-1 p-6 rounded-2xl text-center transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #3df0e0", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <div className="text-5xl mb-3">🖥️</div>
          <div className="gpx text-xs mb-2" style={{ color: "#3df0e0" }}>NIPPON OS</div>
          <p className="gtm text-xl" style={{ color: "#fff" }}>Der verspielte Pixel-Desktop mit Fenstern, Spielen &amp; allem Drum &amp; Dran</p>
        </button>
        {/* Einfach */}
        <button onClick={() => onChoose("classic")}
          className="flex-1 p-6 rounded-2xl text-center transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.08)", border: "2px solid #ff2a6d", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <div className="text-5xl mb-3">📄</div>
          <div className="gpx text-xs mb-2" style={{ color: "#ff2a6d" }}>EINFACH</div>
          <p className="gtm text-xl" style={{ color: "#fff" }}>Die klassische, klare Ansicht — perfekt zum schnellen Stöbern</p>
        </button>
      </div>

      <p className="gtm text-lg mt-8" style={{ color: "rgba(255,255,255,0.5)" }}>(deine Wahl wird gemerkt — jederzeit umschaltbar)</p>
    </div>
  );
}
