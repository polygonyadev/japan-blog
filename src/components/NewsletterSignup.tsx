"use client";
import { useState } from "react";
import { Mail, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function NewsletterSignup() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) setSent(true);
      else { const d = await res.json(); setError(d.error ?? "Fehler"); }
    } catch { setError("Netzwerkfehler."); }
    setSending(false);
  }

  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 transition-colors hover:opacity-80"
      >
        <span className="flex items-center gap-2">
          <Mail size={16} style={{ color: "var(--accent-cyan)" }} />
          <span className="font-bold text-sm">{t.newsletterTitle}</span>
        </span>
        {open
          ? <ChevronUp size={15} style={{ color: "var(--text-secondary)" }} />
          : <ChevronDown size={15} style={{ color: "var(--text-secondary)" }} />}
      </button>

      {open && (
      <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border)" }}>
      {sent ? (
        <div className="text-center py-4">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-sm font-medium">{t.newsletterDone}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {t.newsletterDoneText}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 pt-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t.newsletterText}
          </p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholderOptional}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <div className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="deine@email.com" required
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button type="submit" disabled={sending || !email.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              <Send size={13} /> {sending ? "..." : t.subscribe}
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: "var(--accent-pink)" }}>{error}</p>}
          <a href="/abmelden" className="text-xs text-center transition-colors hover:underline" style={{ color: "var(--text-secondary)" }}>
            {t.unsubLink}
          </a>
        </form>
      )}
      </div>
      )}
    </div>
  );
}
