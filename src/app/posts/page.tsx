"use client";
import { useState } from "react";
import { LayoutGrid, List, MapPin } from "lucide-react";
import PostCard from "@/components/PostCard";
import { POSTS, SEASON_INFO } from "@/lib/data";

type View = "grid" | "timeline";

export default function PostsPage() {
  const [view, setView] = useState<View>("grid");

  return (
    <div className="min-h-screen pt-14 max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alle Posts</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {POSTS.length} Einträge aus Japan
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: view === "grid" ? "rgba(0,212,255,0.1)" : "transparent",
              color: view === "grid" ? "var(--accent-cyan)" : "var(--text-secondary)",
              border: view === "grid" ? "1px solid rgba(0,212,255,0.3)" : "1px solid transparent",
            }}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            onClick={() => setView("timeline")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: view === "timeline" ? "rgba(0,212,255,0.1)" : "transparent",
              color: view === "timeline" ? "var(--accent-cyan)" : "var(--text-secondary)",
              border: view === "timeline" ? "1px solid rgba(0,212,255,0.3)" : "1px solid transparent",
            }}
          >
            <List size={14} /> Timeline
          </button>
        </div>
      </div>

      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POSTS.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {view === "timeline" && (
        <div className="relative">
          {/* vertical line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-px"
            style={{ background: "var(--border)" }}
          />
          <div className="flex flex-col gap-6">
            {POSTS.map((post, i) => {
              const season = post.season ? SEASON_INFO[post.season] : null;
              return (
                <div key={post.id} className="flex gap-6 items-start">
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 w-12 flex justify-center">
                    <div
                      className="w-4 h-4 rounded-full border-2 mt-1"
                      style={{
                        background: "var(--bg-primary)",
                        borderColor: i === 0 ? "var(--accent-pink)" : "var(--border)",
                        boxShadow: i === 0 ? "0 0 8px rgba(255,45,107,0.5)" : "none",
                      }}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 glass rounded-xl p-4 hover:scale-[1.01] transition-transform cursor-pointer"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {new Date(post.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <h3 className="font-bold text-base mt-0.5">{post.title}</h3>
                      </div>
                      {season && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${season.color}22`, color: season.color }}
                        >
                          {season.emoji} {season.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <MapPin size={11} style={{ color: "var(--accent-pink)" }} />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
