"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function TokyoTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const tokyo = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      setTime(tokyo.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg glass"
      style={{ border: "1px solid var(--border)", fontSize: "11px" }}
    >
      <Clock size={11} style={{ color: "var(--accent-cyan)" }} />
      <span style={{ color: "var(--text-secondary)" }}>🇯🇵</span>
      <span className="font-mono font-medium tabular-nums">{time}</span>
    </div>
  );
}
