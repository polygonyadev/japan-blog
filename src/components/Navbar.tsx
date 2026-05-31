"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, BookOpen, Image, List, Home, GraduationCap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import BuyMeCoffee from "@/components/BuyMeCoffee";

const links = [
  { href: "/",            label: "Home",       icon: Home },
  { href: "/posts",       label: "Posts",      icon: BookOpen },
  { href: "/map",         label: "Karte",      icon: MapPin },
  { href: "/gallery",     label: "Galerie",    icon: Image },
  { href: "/bucket-list", label: "Bucket List",icon: List },
  { href: "/japanisch",   label: "Japanisch",  icon: GraduationCap },
];

export default function Navbar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span style={{ color: "var(--accent-pink)" }}>日</span>
          <span style={{ color: "var(--text-primary)" }}>Japan Diary</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  color: active ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background: active ? "rgba(0,212,255,0.08)" : "transparent",
                }}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <div className="hidden sm:block ml-2">
            <BuyMeCoffee compact />
          </div>
          <button
            onClick={toggle}
            className="ml-2 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: "var(--text-secondary)" }}
            title={theme === "dark" ? "Heller Modus" : "Dunkler Modus"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
