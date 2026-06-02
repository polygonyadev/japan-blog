"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function BackLinkTop() {
  const { t } = useLanguage();
  return (
    <Link href="/posts"
      className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-cyan-300"
      style={{ color: "var(--text-secondary)" }}>
      <ArrowLeft size={14} /> {t.backToPosts}
    </Link>
  );
}

export function BackLinkBottom() {
  const { t } = useLanguage();
  return (
    <Link href="/posts"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:scale-105 glass"
      style={{ border: "1px solid var(--border)" }}>
      <ArrowLeft size={14} /> {t.backToAllPosts}
    </Link>
  );
}
