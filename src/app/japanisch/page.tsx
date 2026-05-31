"use client";
import { useState } from "react";
import { GraduationCap, BookOpen } from "lucide-react";

type JLPT = "N5" | "N4" | "N3" | "N2" | "N1";

interface Lesson {
  id: string;
  jlpt: JLPT;
  tags: string[];
  title: string;
  description: string;
  emoji: string;
  phrases: { jp: string; romaji: string; de: string }[];
}

const lessons: Lesson[] = [
  {
    id: "1",
    jlpt: "N5",
    tags: ["Alltag", "Begrüssung"],
    title: "Grundlegende Begrüssungen",
    description: "Die wichtigsten Phrasen für den Alltag in Japan",
    emoji: "👋",
    phrases: [
      { jp: "こんにちは", romaji: "Konnichiwa", de: "Guten Tag / Hallo" },
      { jp: "おはようございます", romaji: "Ohayō gozaimasu", de: "Guten Morgen (formell)" },
      { jp: "こんばんは", romaji: "Konbanwa", de: "Guten Abend" },
      { jp: "ありがとうございます", romaji: "Arigatō gozaimasu", de: "Vielen Dank" },
      { jp: "すみません", romaji: "Sumimasen", de: "Entschuldigung / Excuse me" },
    ],
  },
  {
    id: "2",
    jlpt: "N5",
    tags: ["Essen", "Restaurant"],
    title: "Im Restaurant bestellen",
    description: "Was man beim Essen gehen braucht",
    emoji: "🍜",
    phrases: [
      { jp: "これをください", romaji: "Kore o kudasai", de: "Das hier bitte" },
      { jp: "おいしい！", romaji: "Oishii!", de: "Lecker!" },
      { jp: "お会計をお願いします", romaji: "Okaikei o onegaishimasu", de: "Die Rechnung bitte" },
      { jp: "辛くないですか？", romaji: "Karakunai desu ka?", de: "Ist es nicht scharf?" },
      { jp: "一つください", romaji: "Hitotsu kudasai", de: "Einmal bitte" },
    ],
  },
  {
    id: "3",
    jlpt: "N4",
    tags: ["Reise", "Navigation"],
    title: "Wegbeschreibung",
    description: "Sich in der Stadt zurechtfinden",
    emoji: "🗺️",
    phrases: [
      { jp: "〜はどこですか？", romaji: "〜wa doko desu ka?", de: "Wo ist...?" },
      { jp: "右に曲がってください", romaji: "Migi ni magatte kudasai", de: "Bitte rechts abbiegen" },
      { jp: "左に曲がってください", romaji: "Hidari ni magatte kudasai", de: "Bitte links abbiegen" },
      { jp: "まっすぐ行ってください", romaji: "Massugu itte kudasai", de: "Bitte geradeaus gehen" },
      { jp: "駅はどこですか？", romaji: "Eki wa doko desu ka?", de: "Wo ist der Bahnhof?" },
    ],
  },
  {
    id: "4",
    jlpt: "N5",
    tags: ["Einkaufen", "Alltag"],
    title: "Einkaufen & Preise",
    description: "Im Konbini und auf dem Markt",
    emoji: "🛒",
    phrases: [
      { jp: "いくらですか？", romaji: "Ikura desu ka?", de: "Wie viel kostet das?" },
      { jp: "高い！", romaji: "Takai!", de: "Teuer!" },
      { jp: "安い！", romaji: "Yasui!", de: "Günstig!" },
      { jp: "これをください", romaji: "Kore o kudasai", de: "Das hier bitte" },
      { jp: "袋はいりません", romaji: "Fukuro wa irimasen", de: "Keine Tüte nötig" },
    ],
  },
  {
    id: "5",
    jlpt: "N3",
    tags: ["Alltag", "Gefühle"],
    title: "Gefühle ausdrücken",
    description: "Wie man sagt was man fühlt",
    emoji: "💬",
    phrases: [
      { jp: "嬉しいです", romaji: "Ureshii desu", de: "Ich freue mich" },
      { jp: "疲れました", romaji: "Tsukaremashita", de: "Ich bin müde" },
      { jp: "びっくりしました！", romaji: "Bikkuri shimashita!", de: "Das hat mich überrascht!" },
      { jp: "感動しました", romaji: "Kandō shimashita", de: "Ich war bewegt / beeindruckt" },
      { jp: "懐かしい", romaji: "Natsukashii", de: "Nostalgie (kein dt. Äquivalent)" },
    ],
  },
];

const JLPT_LEVELS: JLPT[] = ["N5", "N4", "N3", "N2", "N1"];
const JLPT_COLOR: Record<JLPT, string> = {
  N5: "#00d4ff",
  N4: "#66e0a0",
  N3: "#ffd166",
  N2: "#ff9944",
  N1: "#ff2d6b",
};
const JLPT_DESC: Record<JLPT, string> = {
  N5: "Einsteiger",
  N4: "Grundkenntnisse",
  N3: "Mittelstufe",
  N2: "Fortgeschritten",
  N1: "Fliessend",
};

const allTags = Array.from(new Set(lessons.flatMap(l => l.tags)));

export default function JapanischPage() {
  const [activeJLPT, setActiveJLPT] = useState<JLPT | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = lessons.filter(l => {
    if (activeJLPT && l.jlpt !== activeJLPT) return false;
    if (activeTag && !l.tags.includes(activeTag)) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-14 max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={28} style={{ color: "var(--accent-cyan)" }} />
          <h1 className="text-3xl font-bold">Selbst Japanisch lernen</h1>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>
          Phrasen und Lektionen die ich unterwegs gesammelt habe — für alle die sich inspirieren lassen wollen.
        </p>

        {/* Hiragana strip */}
        <div className="mt-5 p-4 rounded-2xl text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Hiragana</p>
          <p className="text-xl tracking-widest" style={{ color: "var(--accent-pink)", fontWeight: 300 }}>
            あいうえお　かきくけこ　さしすせそ
          </p>
          <p className="text-xl tracking-widest mt-1" style={{ color: "var(--accent-cyan)", fontWeight: 300 }}>
            たちつてと　なにぬねの　はひふへほ
          </p>
        </div>
      </div>

      {/* JLPT filter */}
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: "var(--text-secondary)" }}>JLPT:</span>
        <button
          onClick={() => setActiveJLPT(null)}
          className="text-xs px-3 py-1 rounded-full transition-all"
          style={{
            background: !activeJLPT ? "rgba(255,255,255,0.1)" : "transparent",
            color: !activeJLPT ? "var(--text-primary)" : "var(--text-secondary)",
            border: `1px solid ${!activeJLPT ? "rgba(255,255,255,0.25)" : "var(--border)"}`,
          }}
        >
          Alle
        </button>
        {JLPT_LEVELS.map(level => {
          const active = activeJLPT === level;
          const color = JLPT_COLOR[level];
          return (
            <button
              key={level}
              onClick={() => setActiveJLPT(active ? null : level)}
              className="text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1.5"
              style={{
                background: active ? `${color}20` : "transparent",
                color: active ? color : "var(--text-secondary)",
                border: `1px solid ${active ? `${color}60` : "var(--border)"}`,
              }}
            >
              <span className="font-bold">{level}</span>
              <span className="opacity-70">{JLPT_DESC[level]}</span>
            </button>
          );
        })}
      </div>

      {/* Tag filter */}
      <div className="mb-8 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: "var(--text-secondary)" }}>Thema:</span>
        <button
          onClick={() => setActiveTag(null)}
          className="text-xs px-3 py-1 rounded-full transition-all"
          style={{
            background: !activeTag ? "rgba(255,45,107,0.15)" : "transparent",
            color: !activeTag ? "var(--accent-pink)" : "var(--text-secondary)",
            border: `1px solid ${!activeTag ? "rgba(255,45,107,0.4)" : "var(--border)"}`,
          }}
        >
          Alle
        </button>
        {allTags.map(tag => {
          const active = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(active ? null : tag)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: active ? "rgba(255,45,107,0.15)" : "transparent",
                color: active ? "var(--accent-pink)" : "var(--text-secondary)",
                border: `1px solid ${active ? "rgba(255,45,107,0.4)" : "var(--border)"}`,
              }}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      {(activeJLPT || activeTag) && (
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {filtered.length} Lektion{filtered.length !== 1 ? "en" : ""} gefunden
        </p>
      )}

      {/* Lessons */}
      <div className="flex flex-col gap-6">
        {filtered.length === 0 && (
          <p style={{ color: "var(--text-secondary)" }}>Keine Lektionen für diese Kombination.</p>
        )}
        {filtered.map(lesson => {
          const jlptColor = JLPT_COLOR[lesson.jlpt];
          return (
            <div key={lesson.id} className="glass rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="p-5 flex items-start gap-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-3xl">{lesson.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-lg">{lesson.title}</h2>
                    {/* JLPT badge */}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${jlptColor}20`, color: jlptColor, border: `1px solid ${jlptColor}50` }}
                    >
                      {lesson.jlpt}
                    </span>
                    {/* Tag badges */}
                    {lesson.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full cursor-pointer"
                        style={{ background: "rgba(255,45,107,0.08)", color: "var(--accent-pink)", border: "1px solid rgba(255,45,107,0.2)" }}
                        onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{lesson.description}</p>
                </div>
              </div>

              <div className="divide-y" style={{ "--tw-divide-color": "var(--border)" } as React.CSSProperties}>
                {lesson.phrases.map((phrase, i) => (
                  <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-center">
                      <span className="text-xl">{phrase.jp}</span>
                      <span className="text-sm italic" style={{ color: "var(--accent-cyan)" }}>{phrase.romaji}</span>
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{phrase.de}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="mt-8 p-6 rounded-2xl text-center" style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
        <BookOpen size={24} className="mx-auto mb-2" style={{ color: "var(--text-secondary)" }} />
        <p className="font-medium">Mehr Lektionen kommen bald</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Hiragana, Katakana, Kanji — ich lerne selbst jeden Tag dazu und teile es hier.
        </p>
      </div>
    </div>
  );
}
