"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, MapPin, Calendar } from "lucide-react";
import { Post, SEASON_INFO, WEATHER_INFO } from "@/lib/data";

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const season = post.season ? SEASON_INFO[post.season] : null;
  const weather = post.weather ? WEATHER_INFO[post.weather] : null;

  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    if (!liked) { setLikes(l => l + 1); setLiked(true); }
    else { setLikes(l => l - 1); setLiked(false); }
  }

  return (
    <Link href={`/posts/${post.slug}`}>
      <article
        className="glass rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300"
        style={{ border: "1px solid var(--border)" }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-cyan)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        {/* Cover image or placeholder */}
        <div className="h-40 relative overflow-hidden flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-card))" }}
        >
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
              {season?.emoji ?? "🗾"}
            </span>
          )}
          {season && (
            <span
              className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${season.color}22`, color: season.color, border: `1px solid ${season.color}44` }}
            >
              {season.emoji} {season.label}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <Calendar size={11} />
            <span>{new Date(post.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</span>
            {weather && <span className="ml-auto">{weather.emoji} {weather.label}</span>}
          </div>

          <h3 className="font-bold text-base leading-snug group-hover:text-cyan-300 transition-colors">
            {post.title}
          </h3>

          <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <MapPin size={12} style={{ color: "var(--accent-pink)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.location}</span>
            <button
              onClick={handleLike}
              className="ml-auto flex items-center gap-1 text-xs transition-all duration-200 hover:scale-110"
              style={{ color: liked ? "var(--accent-pink)" : "var(--text-secondary)" }}
            >
              <Heart size={13} fill={liked ? "currentColor" : "none"} />
              {likes}
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {(post.tags ?? []).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,212,255,0.08)", color: "var(--accent-cyan)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
