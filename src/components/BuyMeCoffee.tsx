"use client";
import Link from "next/link";
import { Coffee } from "lucide-react";

const BMC_URL = "https://ko-fi.com/davidae";

export default function BuyMeCoffee({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={BMC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
      style={{
        background: "#FF5E5B",
        color: "#ffffff",
        boxShadow: "0 2px 12px rgba(255,94,91,0.3)",
      }}
    >
      <Coffee size={16} />
      <span>{compact ? "Support me" : "Support on Ko-fi"}</span>
    </Link>
  );
}
