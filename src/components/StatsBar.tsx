"use client";
import { useEffect, useState } from "react";

interface Props {
  daysInJapan: number;
  citiesVisited: number;
  photosUploaded: number;
  postsWritten: number;
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
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
        {count.toLocaleString("de-DE")}
      </span>
      <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}

export default function StatsBar({ daysInJapan, citiesVisited, photosUploaded, postsWritten }: Props) {
  return (
    <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <StatItem label="Tage in Japan" value={daysInJapan}    color="var(--accent-cyan)" />
        <StatItem label="Städte"        value={citiesVisited}  color="var(--accent-pink)" />
        <StatItem label="Fotos"         value={photosUploaded} color="var(--accent-gold)" />
        <StatItem label="Posts"         value={postsWritten}   color="var(--accent-cyan)" />
      </div>
    </div>
  );
}
