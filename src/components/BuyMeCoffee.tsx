"use client";
import Link from "next/link";
import { Coffee } from "lucide-react";

const BMC_URL = "https://buymeacoffee.com/DEIN_USERNAME";

export default function BuyMeCoffee({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={BMC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
      style={{
        background: "#FFDD00",
        color: "#000000",
        boxShadow: "0 2px 12px rgba(255,221,0,0.3)",
      }}
    >
      <Coffee size={16} />
      {!compact && <span>Buy me a coffee</span>}
    </Link>
  );
}
