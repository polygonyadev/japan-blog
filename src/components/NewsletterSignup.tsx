"use client";
import { useState } from "react";
import { Mail, Send } from "lucide-react";

export default function NewsletterSignup() {
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
    <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Mail size={18} style={{ color: "var(--accent-cyan)" }} />
        <h3 className="font-bold text-base">Updates per Mail</h3>
      </div>
      {sent ? (
        <div className="text-center py-3">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-sm font-medium">Du bist dabei!</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Du erhältst eine Mail wenn es Neuigkeiten gibt.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Trag deine E-Mail ein und ich melde mich wenn es neue Posts oder Updates gibt.
          </p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name (optional)"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <div className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="deine@email.com" required
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button type="submit" disabled={sending || !email.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              <Send size={13} /> {sending ? "..." : "Eintragen"}
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: "var(--accent-pink)" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
