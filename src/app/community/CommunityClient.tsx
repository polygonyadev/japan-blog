"use client";
import { useState } from "react";
import { MessageCircle, Lightbulb, HelpCircle, Send, Clock, Reply, ChevronDown, ChevronUp } from "lucide-react";

interface Reply { _key?: string; name: string; message: string; createdAt?: string }
interface Post { _id: string; name: string; message: string; kategorie?: string; createdAt?: string; antworten?: Reply[] }

const KAT_ICON: Record<string, React.ReactNode> = {
  tipp:      <Lightbulb size={13} />,
  frage:     <HelpCircle size={13} />,
  allgemein: <MessageCircle size={13} />,
};
const KAT_LABEL: Record<string, string> = { tipp: "Tipp", frage: "Frage", allgemein: "Allgemein" };
const KAT_COLOR: Record<string, string> = { tipp: "var(--accent-gold)", frage: "var(--accent-cyan)", allgemein: "var(--text-secondary)" };

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `vor ${d} Tag${d > 1 ? "en" : ""}`;
  if (h > 0) return `vor ${h} Std.`;
  if (m > 0) return `vor ${m} Min.`;
  return "gerade eben";
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ background: `${color}22`, color }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ReplyForm({ postId, onSent }: { postId: string; onSent: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/community/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, name, message }),
      });
      if (res.ok) { setSent(true); onSent(); }
      else { const d = await res.json(); setError(d.error ?? "Fehler"); }
    } catch { setError("Netzwerkfehler."); }
    setSending(false);
  }

  if (sent) return (
    <div className="mt-3 p-4 rounded-xl" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)" }}>
      <p className="font-semibold text-sm mb-1" style={{ color: "var(--accent-cyan)" }}>✅ Antwort gesendet!</p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Deine Antwort wird kurz geprüft und erscheint danach hier. Danke fürs Mitmachen! 🙏
      </p>
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} maxLength={50}
          placeholder="Dein Name"
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <div className="sm:col-span-2 flex gap-2">
          <input value={message} onChange={e => setMessage(e.target.value)} maxLength={500}
            placeholder="Deine Antwort..."
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <button type="submit" disabled={sending || !name.trim() || !message.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
            <Send size={13} />
          </button>
        </div>
      </div>
      {error && <p className="text-xs" style={{ color: "var(--accent-pink)" }}>{error}</p>}
    </form>
  );
}

function PostCard({ post }: { post: Post }) {
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const kat = post.kategorie ?? "allgemein";
  const color = KAT_COLOR[kat];
  const replyCount = (post.antworten ?? []).length;

  return (
    <div className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Avatar name={post.name} color={color} />
          <div>
            <span className="font-semibold text-sm">{post.name}</span>
            {post.createdAt && (
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <Clock size={10} /> {timeAgo(post.createdAt)}
              </div>
            )}
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}>
          {KAT_ICON[kat]} {KAT_LABEL[kat]}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed mb-3">{post.message}</p>

      {/* Replies */}
      {replyCount > 0 && (
        <div className="mb-3">
          <button onClick={() => setShowReplies(v => !v)}
            className="flex items-center gap-1.5 text-xs mb-2 transition-colors"
            style={{ color: "var(--text-secondary)" }}>
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {replyCount} Antwort{replyCount > 1 ? "en" : ""}
          </button>

          {showReplies && (
            <div className="flex flex-col gap-3 pl-4" style={{ borderLeft: "2px solid var(--border)" }}>
              {(post.antworten ?? []).map((r, i) => (
                <div key={r._key ?? i}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Avatar name={r.name} color="var(--accent-cyan)" />
                    <div>
                      <span className="font-semibold text-xs">{r.name}</span>
                      {r.createdAt && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Clock size={10} /> {timeAgo(r.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm ml-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <button onClick={() => setShowReply(v => !v)}
          className="flex items-center gap-1.5 text-xs transition-all hover:scale-105 px-3 py-1.5 rounded-lg"
          style={{ color: showReply ? "var(--accent-cyan)" : "var(--text-secondary)", background: showReply ? "rgba(0,212,255,0.08)" : "transparent", border: `1px solid ${showReply ? "rgba(0,212,255,0.3)" : "transparent"}` }}>
          <Reply size={13} /> Antworten
        </button>
      </div>

      {showReply && (
        <ReplyForm postId={post._id} onSent={() => setShowReply(false)} />
      )}
    </div>
  );
}

export default function CommunityClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts] = useState(initialPosts);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [kategorie, setKategorie] = useState("allgemein");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, kategorie }),
      });
      if (res.ok) { setSent(true); setName(""); setMessage(""); setKategorie("allgemein"); }
      else { const d = await res.json(); setError(d.error ?? "Fehler"); }
    } catch { setError("Netzwerkfehler."); }
    setSending(false);
  }

  const filtered = filter ? posts.filter(p => p.kategorie === filter) : posts;

  return (
    <div className="min-h-screen pt-14 max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <MessageCircle size={28} style={{ color: "var(--accent-cyan)" }} />
        <h1 className="text-3xl font-bold">Community</h1>
      </div>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        Stell Fragen, teile Tipps oder diskutiere — kein Account nötig.
      </p>

      {/* New post form */}
      <div className="glass rounded-2xl p-6 mb-8" style={{ border: "1px solid var(--border)" }}>
        <h2 className="font-bold text-lg mb-4">Neuer Beitrag</h2>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium">Danke! Dein Beitrag erscheint nach kurzer Prüfung.</p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm underline" style={{ color: "var(--accent-cyan)" }}>
              Weiteren Beitrag schreiben
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="Dein Name"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Kategorie</label>
                <select value={kategorie} onChange={e => setKategorie(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="allgemein">💬 Allgemein</option>
                  <option value="tipp">💡 Tipp</option>
                  <option value="frage">❓ Frage</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Nachricht *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={3}
                placeholder="Dein Beitrag..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            {error && <p className="text-sm" style={{ color: "var(--accent-pink)" }}>{error}</p>}
            <button type="submit" disabled={sending || !name.trim() || !message.trim()}
              className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              <Send size={14} /> {sending ? "Wird gesendet..." : "Beitrag senden"}
            </button>
          </form>
        )}
      </div>

      {/* Filter */}
      {posts.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[null, "allgemein", "tipp", "frage"].map(k => (
            <button key={k ?? "all"} onClick={() => setFilter(k)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: filter === k ? "rgba(0,212,255,0.1)" : "transparent", color: filter === k ? "var(--accent-cyan)" : "var(--text-secondary)", border: `1px solid ${filter === k ? "rgba(0,212,255,0.3)" : "var(--border)"}` }}>
              {k === null ? "Alle" : k === "allgemein" ? "💬 Allgemein" : k === "tipp" ? "💡 Tipps" : "❓ Fragen"}
              {k !== null && ` (${posts.filter(p => p.kategorie === k).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
            <p className="text-4xl mb-3">💬</p>
            <p style={{ color: "var(--text-secondary)" }}>Noch keine Beiträge — sei der Erste!</p>
          </div>
        ) : (
          filtered.map(post => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
