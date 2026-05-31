"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const key = `liked-${postId}`;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  useEffect(() => {
    const wasLiked = localStorage.getItem(key) === "1";
    setLiked(wasLiked);
    // Adjust displayed count to reflect stored like
    if (wasLiked) setLikes(initialLikes + 1);
    else setLikes(initialLikes);
  }, [key, initialLikes]);

  function toggle() {
    if (!liked) {
      setLikes(initialLikes + 1);
      setLiked(true);
      localStorage.setItem(key, "1");
    } else {
      setLikes(initialLikes);
      setLiked(false);
      localStorage.removeItem(key);
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200 hover:scale-105"
      style={{
        background: liked ? "rgba(255,45,107,0.12)" : "var(--bg-card)",
        color: liked ? "var(--accent-pink)" : "var(--text-secondary)",
        border: `1px solid ${liked ? "rgba(255,45,107,0.3)" : "var(--border)"}`,
      }}
    >
      <Heart size={14} fill={liked ? "currentColor" : "none"} />
      {likes}
    </button>
  );
}
