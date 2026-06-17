"use client";
import { useEffect, useState } from "react";
import HomeClient from "@/app/HomeClient";
import NipponDesktop from "@/app/lab/NipponDesktop";

type Mode = "loading" | "os" | "classic";
const KEY = "nippon-exp";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[]; bucketItems: any[]; settings: any; stats: any;
}

export default function EntryGate(props: Props) {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const host = window.location.hostname;
    // Domain entscheidet: nippondiary.com → klassisch, nippon-os.com → NipponOS.
    if (host.includes("nippon-os")) { setMode("os"); return; }
    if (host.includes("nippondiary")) { setMode("classic"); return; }
    // Vorschau/localhost: lokale Auswahl, Standard NipponOS.
    setMode(localStorage.getItem(KEY) === "classic" ? "classic" : "os");
  }, []);

  function switchTo(m: "os" | "classic") {
    const host = window.location.hostname;
    // Auf den echten Domains zur jeweils anderen Domain wechseln.
    if (host.includes("nippon-os") && m === "classic") { window.location.href = "https://nippondiary.com"; return; }
    if (host.includes("nippondiary") && m === "os") { window.location.href = "https://nippon-os.com"; return; }
    // Vorschau/localhost: lokal umschalten.
    localStorage.setItem(KEY, m);
    setMode(m);
  }

  if (mode === "loading") return <div className="fixed inset-0 z-[1200]" style={{ background: "#1a1a2e" }} />;
  if (mode === "os") return <NipponDesktop posts={props.posts} onSwitchSimple={() => switchTo("classic")} />;
  return <HomeClient posts={props.posts} bucketItems={props.bucketItems} settings={props.settings} stats={props.stats} />;
}
