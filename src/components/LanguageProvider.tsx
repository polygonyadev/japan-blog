"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, translations } from "@/lib/i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LangContext { lang: Lang; toggle: () => void; t: any }
const Ctx = createContext<LangContext>({ lang: "de", toggle: () => {}, t: translations.de });

export function useLanguage() { return useContext(Ctx); }

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("de");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "de") setLang(saved);
  }, []);

  function toggle() {
    setLang(l => {
      const next = l === "de" ? "en" : "de";
      localStorage.setItem("lang", next);
      return next;
    });
  }

  return (
    <Ctx.Provider value={{ lang, toggle, t: translations[lang] }}>
      {children}
    </Ctx.Provider>
  );
}
