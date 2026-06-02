"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  departureDate?: string | null;
  citiesVisited: number;
  photosUploaded: number;
  postsWritten: number;
}

function calcDays(departureDate?: string | null): number {
  if (!departureDate) return 0;
  const start = new Date(departureDate).getTime();
  const now = Date.now();
  if (now < start) return 0;
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
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

export default function StatsBar({ departureDate, citiesVisited, photosUploaded, postsWritten }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("stats-open") === "1";
  });
  const daysInJapan = calcDays(departureDate);

  function toggle() {
    setOpen(v => {
      localStorage.setItem("stats-open", !v ? "1" : "0");
      return !v;
    });
  }

  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-6 py-3 transition-colors hover:opacity-80"
        style={{ color: "var(--text-secondary)" }}
      >
        <span className="text-xs uppercase tracking-widest font-medium">{t.statsLabel}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ borderTop: "1px solid var(--border)" }}>
          <StatItem label={t.daysInJapan} value={daysInJapan}    color="var(--accent-cyan)" />
          <StatItem label={t.cities}      value={citiesVisited}  color="var(--accent-pink)" />
          <StatItem label={t.photos}      value={photosUploaded} color="var(--accent-gold)" />
          <StatItem label={t.postsCount}  value={postsWritten}   color="var(--accent-cyan)" />
        </div>
      )}
    </div>
  );
}
