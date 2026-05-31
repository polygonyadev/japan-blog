import MiniMap from "@/components/MiniMap";
import { POSTS, BUCKET_LIST, SEASON_INFO } from "@/lib/data";
import { MapPin } from "lucide-react";

export default function MapPage() {
  const allMarkers = [
    ...POSTS.filter(p => p.lat && p.lng).map(p => ({ lat: p.lat!, lng: p.lng!, label: `📝 ${p.location ?? ""}` })),
    ...BUCKET_LIST.filter(b => !b.done).map(b => ({ lat: b.lat, lng: b.lng, label: `📍 ${b.title}` })),
  ];

  return (
    <div className="min-h-screen pt-14 max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Karte 🗾</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Alle besuchten Orte und geplante Ziele
        </p>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-pink)" }} />
          Besuchte Orte ({POSTS.length})
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span className="w-3 h-3 rounded-full" style={{ background: "var(--accent-cyan)" }} />
          Geplante Ziele ({BUCKET_LIST.filter(b => !b.done).length})
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden mb-8" style={{ border: "1px solid var(--border)" }}>
        <MiniMap markers={allMarkers} height="500px" zoom={5} />
      </div>

      {/* Post list below map */}
      <h2 className="text-xl font-bold mb-4">Besuchte Orte</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {POSTS.map(post => {
          const season = post.season ? SEASON_INFO[post.season] : null;
          return (
            <div
              key={post.id}
              className="glass rounded-xl p-4 flex items-start gap-3 hover:scale-[1.01] transition-transform"
              style={{ border: "1px solid var(--border)" }}
            >
              <MapPin size={16} style={{ color: "var(--accent-pink)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="font-medium text-sm">{post.location}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {new Date(post.date).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                  {season && <>{" · "}{season.emoji} {season.label}</>}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{post.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
