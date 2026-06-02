"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, BookOpen, Image, List, Home, GraduationCap, Sun, Moon, MessageCircle } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import BuyMeCoffee from "@/components/BuyMeCoffee";
import TokyoTime from "@/components/TokyoTime";

export default function Navbar() {
  const path = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLanguage();

  const links = [
    { href: "/",            label: t.home,       icon: Home },
    { href: "/posts",       label: t.posts,      icon: BookOpen },
    { href: "/map",         label: t.map,        icon: MapPin },
    { href: "/gallery",     label: t.gallery,    icon: Image },
    { href: "/bucket-list", label: t.bucketList, icon: List },
    { href: "/japanisch",   label: t.japanese,   icon: GraduationCap },
    { href: "/community",   label: t.community,  icon: MessageCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span style={{ color: "var(--accent-pink)" }}>日</span>
          <span style={{ color: "var(--text-primary)" }}>Nippon Diary</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{ color: active ? "var(--accent-cyan)" : "var(--text-secondary)", background: active ? "rgba(0,212,255,0.08)" : "transparent" }}>
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {/* Tokyo time */}
          <div className="hidden lg:block mx-1">
            <TokyoTime />
          </div>

          {/* Language toggle */}
          <button onClick={toggleLang}
            className="ml-1 px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-110"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            title={lang === "de" ? "Switch to English" : "Auf Deutsch wechseln"}>
            {lang === "de" ? "EN" : "DE"}
          </button>

          {/* Support */}
          <div className="hidden sm:block ml-1">
            <BuyMeCoffee compact />
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="ml-1 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: "var(--text-secondary)" }}
            title={theme === "dark" ? t.lightMode : t.darkMode}>
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
