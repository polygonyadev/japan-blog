"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function TokyoTime() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const tokyo = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      setTime(tokyo.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(tokyo.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" }));
    }
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm glass"
      style={{ border: "1px solid var(--border)" }}
    >
      <Clock size={13} style={{ color: "var(--accent-cyan)" }} />
      <span style={{ color: "var(--text-secondary)" }}>Tōkyō</span>
      <span className="font-mono font-medium tabular-nums">{time}</span>
      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{date}</span>
    </div>
  );
}
