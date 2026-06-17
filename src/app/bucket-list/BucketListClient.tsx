"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, CheckCircle2, Circle, BookMarked } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface BucketItem {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  done: boolean;
}

export default function BucketListClient({ initialItems }: { initialItems: BucketItem[] }) {
  // Status (erledigt/offen) wird nur im Studio gesetzt — Besucher können nicht abhaken
  const [items] = useState(initialItems);
  const done = items.filter(i => i.done).length;
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-14 max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.bucketListTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {t.bucketListSubtitle}
        </p>

        {items.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
              <span>{done} / {items.length} {t.done}</span>
              <span>{Math.round((done / items.length) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${items.length > 0 ? (done / items.length) * 100 : 0}%`,
                  background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-pink))",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-medium">{t.noBucketItems}</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {t.addInStudio}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...items].sort((a, b) => Number(a.done) - Number(b.done)).map(item => (
            <div
              key={item._id}
              className="glass rounded-xl p-4 flex items-start gap-4"
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
                <h3
                  className="font-bold text-base"
                  style={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? "var(--text-secondary)" : "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                )}
                {item.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin size={12} style={{ color: "var(--accent-pink)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tipp-Hinweis → Gästebuch */}
      <div className="glass rounded-2xl p-5 mt-8 text-center" style={{ border: "1px solid var(--border)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{t.bucketTip}</p>
        <Link href="/guestbook" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105"
          style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
          <BookMarked size={15} /> {t.bucketTipCta}
        </Link>
      </div>
    </div>
  );
}
