"use client";
import { useState } from "react";
import { MapPin, CheckCircle2, Circle } from "lucide-react";
import { BUCKET_LIST } from "@/lib/data";

export default function BucketListPage() {
  const [items, setItems] = useState(BUCKET_LIST);
  const done = items.filter(i => i.done).length;

  function toggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }

  return (
    <div className="min-h-screen pt-14 max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bucket List 🎯</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Was ich in Japan noch erleben möchte
        </p>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
            <span>{done} von {items.length} erledigt</span>
            <span>{Math.round((done / items.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 glow-cyan"
              style={{
                width: `${(done / items.length) * 100}%`,
                background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-pink))",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            className="glass rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            style={{
              border: `1px solid ${item.done ? "rgba(0,212,255,0.3)" : "var(--border)"}`,
              opacity: item.done ? 0.7 : 1,
            }}
          >
            {item.done
              ? <CheckCircle2 size={20} style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: 1 }} />
              : <Circle size={20} style={{ color: "var(--text-secondary)", flexShrink: 0, marginTop: 1 }} />
            }
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-bold text-base"
                  style={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--text-secondary)" : "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <MapPin size={12} style={{ color: "var(--accent-pink)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs mt-6 text-center" style={{ color: "var(--text-secondary)" }}>
        Klicke auf einen Eintrag um ihn als erledigt zu markieren
      </p>
    </div>
  );
}
