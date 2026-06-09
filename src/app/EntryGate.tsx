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
    // Standard: NipponOS. Nur wenn explizit "classic" gewählt → klassische Seite.
    setMode(localStorage.getItem(KEY) === "classic" ? "classic" : "os");
  }, []);

  function switchTo(m: "os" | "classic") {
    localStorage.setItem(KEY, m);
    setMode(m);
  }

  if (mode === "loading") return <div className="fixed inset-0 z-[100]" style={{ background: "#1a1a2e" }} />;
  if (mode === "os") return <NipponDesktop posts={props.posts} onSwitchSimple={() => switchTo("classic")} />;
  return <HomeClient posts={props.posts} bucketItems={props.bucketItems} settings={props.settings} stats={props.stats} />;
}
