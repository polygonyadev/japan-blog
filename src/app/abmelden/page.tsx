"use client";
import { useState } from "react";
import { Mail, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function UnsubscribePage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setDone(true);
      else { const d = await res.json(); setError(d.error ?? "Fehler"); }
    } catch { setError("Netzwerkfehler."); }
    setSending(false);
  }

  return (
    <div className="min-h-screen pt-14 max-w-md mx-auto px-4 py-16">
      <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg" style={{ background: "rgba(255,45,107,0.1)" }}>
            <X size={18} style={{ color: "var(--accent-pink)" }} />
          </div>
          <h1 className="font-bold text-lg">{t.unsubTitle}</h1>
        </div>

        {done ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">👋</p>
            <p className="font-medium">{t.unsubDone}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {t.unsubDoneText}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t.unsubText}
            </p>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
                placeholder="deine@email.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            {error && <p className="text-xs" style={{ color: "var(--accent-pink)" }}>{error}</p>}
            <button type="submit" disabled={sending || !email.trim()}
              className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "var(--accent-pink)", color: "#fff" }}>
              {sending ? "..." : t.unsubButton}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
