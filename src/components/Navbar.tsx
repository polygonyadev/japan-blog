"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, BookOpen, Image, List, Home, GraduationCap, Sun, Moon, MessageCircle, Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import BuyMeCoffee from "@/components/BuyMeCoffee";

export default function Navbar() {
  const path = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setMenuOpen(false)}>
          <span style={{ color: "var(--accent-pink)" }}>日</span>
          <span style={{ color: "var(--text-primary)" }}>Nippon Diary</span>
        </Link>

        {/* ─── Desktop nav (ab lg) ─── */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{ color: active ? "var(--accent-cyan)" : "var(--text-secondary)", background: active ? "rgba(0,212,255,0.08)" : "transparent" }}>
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}

          <button onClick={toggleLang}
            className="ml-1 px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-110"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            title={lang === "de" ? "Switch to English" : "Auf Deutsch wechseln"}>
            {lang === "de" ? "EN" : "DE"}
          </button>

          <div className="ml-1">
            <BuyMeCoffee compact />
          </div>

          <button onClick={toggleTheme}
            className="ml-1 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: "var(--text-secondary)" }}
            title={theme === "dark" ? t.lightMode : t.darkMode}>
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* ─── Hamburger (unter lg) ─── */}
        <button onClick={() => setMenuOpen(v => !v)}
          className="lg:hidden p-2 rounded-lg transition-all"
          style={{ color: "var(--text-primary)" }}
          aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ─── Mobile dropdown (unter lg) ─── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 top-14 -z-10" style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={() => setMenuOpen(false)} />

          <div className="lg:hidden glass" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active = path === href;
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{ color: active ? "var(--accent-cyan)" : "var(--text-primary)", background: active ? "rgba(0,212,255,0.08)" : "transparent" }}>
                    <Icon size={17} />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* Untere Reihe: Sprache, Theme, Support */}
              <div className="flex items-center gap-3 mt-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <button onClick={toggleLang}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  {lang === "de" ? "EN" : "DE"}
                </button>

                <button onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                  {theme === "dark" ? t.lightMode : t.darkMode}
                </button>

                <div className="ml-auto" onClick={() => setMenuOpen(false)}>
                  <BuyMeCoffee />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
