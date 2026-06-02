"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "polygonyadev/japan-blog");
    script.setAttribute("data-repo-id", "R_kgDOStDIEA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOStDIEM4C-OHA");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme === "dark" ? "dark_dimmed" : "light");
    script.setAttribute("data-lang", "de");
    script.crossOrigin = "anonymous";
    script.async = true;
    ref.current.appendChild(script);
  }, [theme]);

  return (
    <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
      <h2 className="text-xl font-bold mb-6">{t.comments}</h2>
      <div ref={ref} />
      <p className="text-xs mt-4 text-center" style={{ color: "var(--text-secondary)" }}>
        {t.commentsHint}
      </p>
    </div>
  );
}
