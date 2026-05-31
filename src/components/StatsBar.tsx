"use client";
import { useEffect, useState } from "react";
import { STATS } from "@/lib/data";

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  color: string;
}

function StatItem({ label, value, suffix = "", color }: StatItemProps) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>
        {count.toLocaleString("de-DE")}{suffix}
      </span>
      <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  return (
    <div
      className="glass rounded-2xl p-6"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x"
        style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}
      >
        <StatItem label="Tage in Japan"    value={STATS.daysInJapan}      color="var(--accent-cyan)" />
        <StatItem label="Städte"           value={STATS.citiesVisited}     color="var(--accent-pink)" />
        <StatItem label="Fotos"            value={STATS.photosUploaded}    color="var(--accent-gold)" />
        <StatItem label="Posts"            value={STATS.postsWritten}      color="var(--accent-cyan)" />
      </div>
    </div>
  );
}
