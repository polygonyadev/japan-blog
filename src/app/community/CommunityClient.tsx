"use client";
import { useState } from "react";
import { MessageCircle, Lightbulb, HelpCircle, Send, Clock } from "lucide-react";

interface Reply { name: string; message: string; createdAt?: string }
interface Post { _id: string; name: string; message: string; kategorie?: string; createdAt?: string; antworten?: Reply[] }

const KAT_ICON: Record<string, React.ReactNode> = {
  tipp:      <Lightbulb size={14} />,
  frage:     <HelpCircle size={14} />,
  allgemein: <MessageCircle size={14} />,
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

export default function CommunityClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [kategorie, setKategorie] = useState("allgemein");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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
    } catch { setError("Netzwerkfehler. Bitte nochmal versuchen."); }
    setSending(false);
  }

  return (
    <div className="min-h-screen pt-14 max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <MessageCircle size={28} style={{ color: "var(--accent-cyan)" }} />
        <h1 className="text-3xl font-bold">Tipps & Fragen</h1>
      </div>
      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        Stell eine Frage, teile einen Tipp oder hinterlass eine Nachricht. Ich freue mich über jede Rückmeldung!
      </p>

      {/* Form */}
      <div className="glass rounded-2xl p-6 mb-10" style={{ border: "1px solid var(--border)" }}>
        <h2 className="font-bold text-lg mb-4">Nachricht schreiben</h2>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium">Danke für deine Nachricht!</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Sie wird nach kurzer Prüfung hier erscheinen.</p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm underline" style={{ color: "var(--accent-cyan)" }}>
              Weitere Nachricht schreiben
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Dein Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={50}
                  placeholder="z.B. Lisa"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
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
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Nachricht * ({message.length}/1000)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={4}
                placeholder="Dein Tipp, deine Frage oder dein Kommentar..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            {error && <p className="text-sm" style={{ color: "var(--accent-pink)" }}>{error}</p>}
            <button type="submit" disabled={sending || !name.trim() || !message.trim()}
              className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--accent-cyan)", color: "#0d1117" }}>
              <Send size={14} />
              {sending ? "Wird gesendet..." : "Absenden"}
            </button>
          </form>
        )}
      </div>

      {/* Posts */}
      <h2 className="font-bold text-xl mb-4">
        {posts.length > 0 ? `${posts.length} Beiträge` : "Noch keine Beiträge"}
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
          <p className="text-4xl mb-3">💬</p>
          <p style={{ color: "var(--text-secondary)" }}>Sei der Erste — schreib eine Nachricht!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => {
            const kat = post.kategorie ?? "allgemein";
            const color = KAT_COLOR[kat];
            return (
              <div key={post._id} className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: `${color}22`, color }}>
                      {post.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{post.name}</span>
                      {post.createdAt && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Clock size={10} /> {timeAgo(post.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}>
                    {KAT_ICON[kat]} {KAT_LABEL[kat]}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{post.message}</p>

                {post.antworten && post.antworten.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 pl-4" style={{ borderLeft: "2px solid var(--border)" }}>
                    {post.antworten.map((r, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-xs">{r.name}</span>
                          {r.createdAt && <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{timeAgo(r.createdAt)}</span>}
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
