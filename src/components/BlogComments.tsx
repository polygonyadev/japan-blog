"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Send, Clock } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface Comment { _id?: string; name: string; message: string; createdAt?: string }

function timeAgo(iso: string | undefined, en: boolean) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return en ? `${d}d ago` : `vor ${d} T.`;
  if (h > 0) return en ? `${h}h ago` : `vor ${h} Std.`;
  if (m > 0) return en ? `${m}m ago` : `vor ${m} Min.`;
  return en ? "just now" : "gerade eben";
}

export default function BlogComments({ postId, postTitle }: { postId: string; postTitle: string }) {
  const { t, lang } = useLanguage();
  const en = lang === "en";
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`)
      .then(r => r.json()).then(d => setComments(Array.isArray(d) ? d : [])).catch(() => {});
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, postTitle, name, message }),
      });
      if (res.ok) { setSent(true); setName(""); setMessage(""); }
    } catch {}
    setSending(false);
  }

  return (
    <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle size={20} style={{ color: "var(--accent-cyan)" }} /> {t.comments} ({comments.length})
      </h2>

      {/* Liste */}
      <div className="flex flex-col gap-3 mb-8">
        {comments.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {en ? "No comments yet — be the first!" : "Noch keine Kommentare — sei der Erste!"}
          </p>
        ) : comments.map((c, i) => (
          <div key={c._id ?? i} className="glass rounded-2xl p-4" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                style={{ background: "rgba(0,212,255,0.15)", color: "var(--accent-cyan)" }}>{c.name.charAt(0).toUpperCase()}</div>
              <span className="font-semibold text-sm">{c.name}</span>
              {c.createdAt && <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: "var(--text-secondary)" }}><Clock size={10} /> {timeAgo(c.createdAt, en)}</span>}
            </div>
            <p className="text-sm leading-relaxed">{c.message}</p>
          </div>
        ))}
      </div>

      {/* Formular */}
      <div className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
        {sent ? (
          <div className="text-center py-3">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium">{en ? "Thanks! Your comment will be checked and appear here shortly." : "Danke! Dein Kommentar wird kurz geprüft und erscheint dann hier."}</p>
            <button onClick={() => setSent(false)} className="mt-3 text-sm underline" style={{ color: "var(--accent-cyan)" }}>{t.anotherPost}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder={t.yourName}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={3} placeholder={en ? "Your comment..." : "Dein Kommentar..."}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button type="submit" disabled={sending || !name.trim() || !message.trim()}
              className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              <Send size={14} /> {sending ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
