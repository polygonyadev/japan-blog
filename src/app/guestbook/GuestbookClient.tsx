"use client";
import { useState, useEffect } from "react";
import { BookOpen, Send, Clock, Reply } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import NewsletterSignup from "@/components/NewsletterSignup";

interface ReplyT { _key?: string; name: string; message: string; createdAt?: string }
interface Entry { _id: string; name: string; message: string; createdAt?: string; antworten?: ReplyT[] }

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `vor ${d} T.`;
  if (h > 0) return `vor ${h} Std.`;
  if (m > 0) return `vor ${m} Min.`;
  return "gerade eben";
}

export default function GuestbookClient() {
  const { t, lang } = useLanguage();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  // Antworten
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [rName, setRName] = useState("");
  const [rMessage, setRMessage] = useState("");
  const [rSending, setRSending] = useState(false);
  const [rSentId, setRSentId] = useState<string | null>(null);

  useEffect(() => { fetch("/api/guestbook").then(r => r.json()).then(d => setEntries(Array.isArray(d) ? d : [])).catch(() => {}); }, []);

  async function submitReply(e: React.FormEvent, entryId: string) {
    e.preventDefault();
    if (!rName.trim() || !rMessage.trim()) return;
    setRSending(true);
    try {
      const res = await fetch("/api/guestbook/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId, name: rName, message: rMessage }) });
      if (res.ok) { setRSentId(entryId); setReplyTo(null); setRName(""); setRMessage(""); }
    } catch {}
    setRSending(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, message }) });
      if (res.ok) { setSent(true); setName(""); setMessage(""); }
      else { const d = await res.json(); setError(d.error ?? "Fehler"); }
    } catch { setError("Netzwerkfehler."); }
    setSending(false);
  }

  return (
    <div className="min-h-screen pt-14 max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={28} style={{ color: "var(--accent-cyan)" }} />
        <h1 className="text-3xl font-bold">{t.guestbookTitle}</h1>
      </div>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>{t.guestbookSubtitle}</p>

      <div className="mb-8">
        <NewsletterSignup />
      </div>

      <div className="glass rounded-2xl p-6 mb-8" style={{ border: "1px solid var(--border)" }}>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium">{t.guestbookSent}</p>
            <button onClick={() => setSent(false)} className="mt-3 text-sm underline" style={{ color: "var(--accent-cyan)" }}>{t.anotherPost}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder={t.yourName}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={280} rows={3} placeholder={t.yourPost}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            {error && <p className="text-sm" style={{ color: "var(--accent-pink)" }}>{error}</p>}
            <button type="submit" disabled={sending || !name.trim() || !message.trim()}
              className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              <Send size={14} /> {sending ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {entries.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
            <p className="text-4xl mb-3">📖</p>
            <p style={{ color: "var(--text-secondary)" }}>{t.guestbookEmpty}</p>
          </div>
        ) : entries.map(e => (
          <div key={e._id} className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "rgba(0,212,255,0.15)", color: "var(--accent-cyan)" }}>{e.name.charAt(0).toUpperCase()}</div>
              <span className="font-semibold text-sm">{e.name}</span>
              {e.createdAt && <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: "var(--text-secondary)" }}><Clock size={10} /> {timeAgo(e.createdAt)}</span>}
            </div>
            <p className="text-sm leading-relaxed">{e.message}</p>

            {/* Antworten */}
            {(e.antworten ?? []).length > 0 && (
              <div className="mt-3 ml-4 pl-3 flex flex-col gap-2" style={{ borderLeft: "2px solid var(--border)" }}>
                {(e.antworten ?? []).map((a, j) => (
                  <div key={a._key ?? j}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-xs" style={{ color: "var(--accent-cyan)" }}>↳ {a.name}</span>
                      {a.createdAt && <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-secondary)" }}><Clock size={9} /> {timeAgo(a.createdAt)}</span>}
                    </div>
                    <p className="text-sm leading-relaxed">{a.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Antwort-Aktion */}
            <div className="mt-3">
              {rSentId === e._id ? (
                <p className="text-xs" style={{ color: "var(--accent-cyan)" }}>✅ {t.replySent}</p>
              ) : replyTo === e._id ? (
                <form onSubmit={(ev) => submitReply(ev, e._id)} className="flex flex-col gap-2">
                  <input value={rName} onChange={ev => setRName(ev.target.value)} maxLength={40} placeholder={t.yourName}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <textarea value={rMessage} onChange={ev => setRMessage(ev.target.value)} maxLength={280} rows={2} placeholder={t.yourPost}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <div className="flex gap-2 self-end">
                    <button type="button" onClick={() => setReplyTo(null)} className="text-sm px-3 py-1.5" style={{ color: "var(--text-secondary)" }}>{lang === "en" ? "Cancel" : "Abbrechen"}</button>
                    <button type="submit" disabled={rSending || !rName.trim() || !rMessage.trim()}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
                      <Send size={13} /> {rSending ? t.sending : t.send}
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => { setReplyTo(e._id); setRName(""); setRMessage(""); }}
                  className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: "var(--accent-cyan)" }}>
                  <Reply size={13} /> {t.reply}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
