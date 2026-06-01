"use client";
import { useState, useEffect, useRef } from "react";
import { GraduationCap, Search, BookOpen, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DetailModal, MarkdownContent } from "@/components/DetailModal";

type JLPT = "N5" | "N4" | "N3" | "N2" | "N1";
type Tab = "lektionen" | "vokabel" | "kanji" | "grammatik" | "partikel" | "satz" | "notizen";

const JLPT_LEVELS: JLPT[] = ["N5","N4","N3","N2","N1"];
const JLPT_COLOR: Record<JLPT, string> = { N5:"#00d4ff", N4:"#66e0a0", N3:"#ffd166", N2:"#ff9944", N1:"#ff2d6b" };
const JLPT_DESC: Record<JLPT, string> = { N5:"Einsteiger", N4:"Grundkenntnisse", N3:"Mittelstufe", N2:"Fortgeschritten", N1:"Fliessend" };

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "lektionen", label: "Nützliches", emoji: "📚" },
  { id: "vokabel",   label: "Vokabeln",   emoji: "📝" },
  { id: "kanji",     label: "Kanji",      emoji: "漢" },
  { id: "grammatik", label: "Grammatik",  emoji: "🔤" },
  { id: "partikel",  label: "Partikel",   emoji: "🔗" },
  { id: "satz",      label: "Sätze",      emoji: "💬" },
  { id: "notizen",   label: "Lektionen",  emoji: "📋" },
];

// ─── Small reusable components ───────────────────────────────────────────────

function JlptBadge({ level }: { level: string }) {
  const color = JLPT_COLOR[level as JLPT] ?? "var(--text-secondary)";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
      style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
      {level}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold uppercase tracking-widest mb-2 mt-5 first:mt-0"
    style={{ color: "var(--accent-cyan)" }}>{children}</h3>;
}

function ExampleTable({ rows }: { rows: { japanisch?: string; kana?: string; deutsch?: string }[] }) {
  if (!rows?.length) return null;
  return (
    <table className="w-full text-sm mt-2 border-collapse">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
            <td className="py-1.5 pr-4 font-medium">{r.japanisch}</td>
            <td className="py-1.5 pr-4 italic" style={{ color: "var(--accent-cyan)" }}>{r.kana}</td>
            <td className="py-1.5" style={{ color: "var(--text-secondary)" }}>{r.deutsch}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}
        components={{
          table: (props) => <table className="w-full text-sm border-collapse mb-3" {...props} />,
          th: (props) => <th className="text-left py-1.5 pr-4 text-xs font-semibold" style={{ borderBottom:"1px solid var(--border)", color:"var(--accent-cyan)" }} {...props} />,
          td: (props) => <td className="py-1.5 pr-4 text-sm" style={{ borderBottom:"1px solid var(--border)" }} {...props} />,
          code: (props) => <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background:"var(--bg-card)", color:"var(--accent-cyan)" }} {...props} />,
          h2: (props) => <h2 className="text-base font-bold mt-4 mb-2" style={{ color:"var(--accent-cyan)" }} {...props} />,
          h3: (props) => <h3 className="text-sm font-semibold mt-3 mb-1" {...props} />,
          p: (props) => <p className="text-sm mb-2 leading-relaxed" style={{ color:"var(--text-secondary)" }} {...props} />,
          strong: (props) => <strong className="font-bold" style={{ color:"var(--text-primary)" }} {...props} />,
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function Card({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      className={`glass rounded-2xl p-5 transition-all duration-200 ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""}`}
      style={{ border: "1px solid var(--border)" }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="text-center py-16 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
      <p className="text-4xl mb-3">🈳</p>
      <p className="font-medium">Noch keine {tab} eingetragen</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
        Füge Einträge im Studio hinzu.
      </p>
    </div>
  );
}

// ─── JLPT Filter ─────────────────────────────────────────────────────────────

function JlptFilter({ active, onChange }: { active: JLPT | null; onChange: (v: JLPT | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-6">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>JLPT:</span>
      <button onClick={() => onChange(null)}
        className="text-xs px-3 py-1 rounded-full transition-all"
        style={{ background: !active ? "rgba(255,255,255,0.1)" : "transparent", color: !active ? "var(--text-primary)" : "var(--text-secondary)", border: `1px solid ${!active ? "rgba(255,255,255,0.25)" : "var(--border)"}` }}>
        Alle
      </button>
      {JLPT_LEVELS.map(level => (
        <button key={level} onClick={() => onChange(active === level ? null : level)}
          className="text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1"
          style={{ background: active === level ? `${JLPT_COLOR[level]}20` : "transparent", color: active === level ? JLPT_COLOR[level] : "var(--text-secondary)", border: `1px solid ${active === level ? `${JLPT_COLOR[level]}60` : "var(--border)"}` }}>
          <span className="font-bold">{level}</span>
          <span className="opacity-60 hidden sm:inline">{JLPT_DESC[level]}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Tab content sections ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LektionDetail({ lesson }: { lesson: any }) {
  return <>
    <div className="flex items-start gap-3 mb-4">
      <span className="text-3xl">{lesson.emoji ?? "📚"}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h2 className="font-bold text-xl">{lesson.title}</h2>
          {lesson.jlpt && <JlptBadge level={lesson.jlpt} />}
          {(lesson.tags ?? []).map((t: string) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(255,45,107,0.08)", color:"var(--accent-pink)" }}>#{t}</span>
          ))}
        </div>
        {lesson.description && <p style={{ color:"var(--text-secondary)" }}>{lesson.description}</p>}
      </div>
    </div>
    {(lesson.phrases ?? []).length > 0 && (
      <><SectionLabel>Phrasen</SectionLabel>
      <ExampleTable rows={(lesson.phrases ?? []).map((p: { jp: string; romaji: string; de: string }) => ({ japanisch: p.jp, kana: p.romaji, deutsch: p.de }))} /></>
    )}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LektionenSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any>(null);
  const allTags = Array.from(new Set(items.flatMap((l: { tags?: string[] }) => l.tags ?? [])));
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = items.filter((l: { jlpt?: string; tags?: string[] }) => {
    if (jlpt && l.jlpt !== jlpt) return false;
    if (activeTag && !(l.tags ?? []).includes(activeTag)) return false;
    return true;
  });

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Thema:</span>
          {[null, ...allTags].map(tag => (
            <button key={tag ?? "all"} onClick={() => setActiveTag(tag)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: activeTag === tag ? "rgba(255,45,107,0.15)" : "transparent", color: activeTag === tag ? "var(--accent-pink)" : "var(--text-secondary)", border: `1px solid ${activeTag === tag ? "rgba(255,45,107,0.4)" : "var(--border)"}` }}>
              {tag ? `#${tag}` : "Alle"}
            </button>
          ))}
        </div>
      )}
      {filtered.length === 0 ? <EmptyState tab="Nützliches" /> : (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filtered.map((lesson: any) => (
            <Card key={lesson._id} onClick={() => setSelected(lesson)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{lesson.emoji ?? "📚"}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base">{lesson.title}</h3>
                      {lesson.jlpt && <JlptBadge level={lesson.jlpt} />}
                      {(lesson.tags ?? []).map((t: string) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(255,45,107,0.08)", color:"var(--accent-pink)" }}>#{t}</span>
                      ))}
                    </div>
                    {lesson.description && <p className="text-sm mt-0.5" style={{ color:"var(--text-secondary)" }}>{lesson.description}</p>}
                    {(lesson.phrases ?? []).length > 0 && (
                      <p className="text-xs mt-1" style={{ color:"var(--text-secondary)" }}>{(lesson.phrases ?? []).length} Phrasen</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {selected && <DetailModal onClose={() => setSelected(null)}><LektionDetail lesson={selected} /></DetailModal>}
    </div>
  );
}

// ─── Modal detail views ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VokabelDetail({ v }: { v: any }) {
  return <>
    <div className="flex items-start justify-between gap-2 mb-4">
      <div>
        <span className="text-3xl font-bold">{v.wort}</span>
        {v.kana && <span className="text-lg ml-3" style={{ color:"var(--accent-cyan)" }}>{v.kana}</span>}
        <p className="mt-1" style={{ color:"var(--text-secondary)" }}>{v.bedeutung}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {v.jlpt && <JlptBadge level={v.jlpt} />}
        {v.wortart && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"var(--bg-card)", color:"var(--text-secondary)", border:"1px solid var(--border)" }}>{v.wortart}</span>}
      </div>
    </div>
    {v.konjugation?.length > 0 && <><SectionLabel>Konjugation</SectionLabel>
      <table className="w-full text-sm border-collapse mb-3"><tbody>
        {v.konjugation.map((k: { form: string; japanisch: string; kana?: string }, i: number) => (
          <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
            <td className="py-1.5 pr-3 text-xs" style={{ color:"var(--text-secondary)" }}>{k.form}</td>
            <td className="py-1.5 pr-3 font-medium">{k.japanisch}</td>
            <td className="py-1.5 italic text-xs" style={{ color:"var(--accent-cyan)" }}>{k.kana}</td>
          </tr>))}
      </tbody></table></>}
    {(v.beispiele?.length ?? 0) > 0 && <><SectionLabel>Beispiele</SectionLabel><ExampleTable rows={v.beispiele ?? []} /></>}
    {v.notizen && <><SectionLabel>Notizen</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{v.notizen}</p></>}
    {v.markdown && <><SectionLabel>Vollständige Notiz</SectionLabel><MarkdownContent content={v.markdown} /></>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function KanjiDetail({ k }: { k: any }) {
  return <>
    <div className="flex items-start justify-between gap-2 mb-4">
      <div className="flex items-center gap-4">
        <span className="text-6xl font-bold" style={{ color:"var(--accent-pink)" }}>{k.zeichen}</span>
        <div>
          <p className="font-bold text-lg">{k.bedeutung}</p>
          {k.onYomi && <p className="text-sm" style={{ color:"var(--text-secondary)" }}>音読み: {k.onYomi}</p>}
          {k.kunYomi && <p className="text-sm" style={{ color:"var(--text-secondary)" }}>訓読み: {k.kunYomi}</p>}
          {k.radikal && <p className="text-sm" style={{ color:"var(--text-secondary)" }}>Radikal: {k.radikal}</p>}
          {k.strichanzahl && <p className="text-sm" style={{ color:"var(--text-secondary)" }}>{k.strichanzahl} Striche</p>}
        </div>
      </div>
      {k.jlpt && <JlptBadge level={k.jlpt} />}
    </div>
    {k.vokabeln?.length > 0 && <><SectionLabel>Vokabeln</SectionLabel>
      <div className="flex flex-wrap gap-2 mb-3">
        {k.vokabeln.map((v: { wort: string; kana?: string; bedeutung?: string }, i: number) => (
          <span key={i} className="text-sm px-2 py-1 rounded-lg" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
            {v.wort}{v.kana && <span style={{ color:"var(--accent-cyan)" }}> ({v.kana})</span>}{v.bedeutung && <span style={{ color:"var(--text-secondary)" }}> — {v.bedeutung}</span>}
          </span>))}
      </div></>}
    {(k.beispiele?.length ?? 0) > 0 && <><SectionLabel>Beispiele</SectionLabel><ExampleTable rows={k.beispiele ?? []} /></>}
    {k.notizen && <><SectionLabel>Notizen</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{k.notizen}</p></>}
    {k.markdown && <><SectionLabel>Vollständige Notiz</SectionLabel><MarkdownContent content={k.markdown} /></>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GrammatikDetail({ g }: { g: any }) {
  return <>
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="text-2xl font-bold">{g.muster}</h3>
      {g.jlpt && <JlptBadge level={g.jlpt} />}
    </div>
    <p className="mb-3" style={{ color:"var(--text-secondary)" }}>{g.bedeutung}</p>
    {g.struktur && <div className="mb-4 px-3 py-2 rounded-lg text-sm font-mono" style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--accent-cyan)" }}>{g.struktur}</div>}
    {g.bildung?.length > 0 && <><SectionLabel>Bildung</SectionLabel>
      <table className="w-full text-sm border-collapse mb-3"><thead>
        <tr style={{ borderBottom:"1px solid var(--border)" }}>
          {["Wortart","Bildung","Beispiel"].map(h => <th key={h} className="text-left py-1.5 pr-4 text-xs" style={{ color:"var(--text-secondary)" }}>{h}</th>)}
        </tr></thead><tbody>
        {g.bildung.map((b: { wortart: string; bildung: string; beispiel?: string }, i: number) => (
          <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
            <td className="py-1.5 pr-4 text-xs" style={{ color:"var(--text-secondary)" }}>{b.wortart}</td>
            <td className="py-1.5 pr-4">{b.bildung}</td>
            <td className="py-1.5 italic text-xs" style={{ color:"var(--accent-cyan)" }}>{b.beispiel}</td>
          </tr>))}
      </tbody></table></>}
    {(g.beispiele?.length ?? 0) > 0 && <><SectionLabel>Beispiele</SectionLabel><ExampleTable rows={g.beispiele ?? []} /></>}
    {g.fehler && <><SectionLabel>Häufige Fehler</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{g.fehler}</p></>}
    {g.notizen && <><SectionLabel>Notizen</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{g.notizen}</p></>}
    {g.markdown && <><SectionLabel>Vollständige Notiz</SectionLabel><MarkdownContent content={g.markdown} /></>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PartikelDetail({ p }: { p: any }) {
  return <>
    <div className="flex items-start gap-4 mb-4">
      <span className="text-5xl font-bold" style={{ color:"var(--accent-pink)" }}>{p.partikel}</span>
      <div>
        <p className="font-bold text-lg">{p.funktion}</p>
        {p.jlpt && <JlptBadge level={p.jlpt} />}
      </div>
    </div>
    {p.verwendungen?.map((v: { titel: string; struktur?: string; beispiele?: { japanisch: string; kana: string; deutsch: string }[] }, i: number) => (
      <div key={i} className="mb-4">
        <SectionLabel>{i+1}. {v.titel}</SectionLabel>
        {v.struktur && <div className="mb-2 px-3 py-1.5 rounded-lg text-sm font-mono" style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--accent-cyan)" }}>{v.struktur}</div>}
        {(v.beispiele?.length ?? 0) > 0 && <ExampleTable rows={v.beispiele ?? []} />}
      </div>))}
    {p.fehler && <><SectionLabel>Häufige Fehler</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{p.fehler}</p></>}
    {p.notizen && <><SectionLabel>Notizen</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{p.notizen}</p></>}
    {p.markdown && <><SectionLabel>Vollständige Notiz</SectionLabel><MarkdownContent content={p.markdown} /></>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SatzDetail({ s }: { s: any }) {
  return <>
    <div className="mb-4">
      <p className="text-2xl font-medium">{s.japanisch}</p>
      {s.kana && <p className="text-base italic mt-1" style={{ color:"var(--accent-cyan)" }}>{s.kana}</p>}
      <p className="mt-2" style={{ color:"var(--text-secondary)" }}>{s.deutsch}</p>
      {s.jlpt && <div className="mt-2"><JlptBadge level={s.jlpt} /></div>}
    </div>
    {s.kontext && <p className="text-sm px-3 py-2 rounded-lg mb-4" style={{ background:"var(--bg-card)", color:"var(--text-secondary)", border:"1px solid var(--border)" }}>📍 {s.kontext}</p>}
    {s.grammatik && <><SectionLabel>Grammatik</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{s.grammatik}</p></>}
    {s.notizen && <><SectionLabel>Notizen</SectionLabel><p className="text-sm" style={{ color:"var(--text-secondary)" }}>{s.notizen}</p></>}
    {s.markdown && <><SectionLabel>Vollständige Notiz</SectionLabel><MarkdownContent content={s.markdown} /></>}
  </>
}

// ─── Compact sections with click-to-open modal ───────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VokabelSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  const [selected, setSelected] = useState<unknown>(null);
  const filtered = items.filter((v: { jlpt?: string }) => !jlpt || v.jlpt === jlpt);
  if (filtered.length === 0) return <EmptyState tab="Vokabeln" />;
  return <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {filtered.map((v: { _id: string; wort: string; kana?: string; bedeutung: string; jlpt?: string; wortart?: string }) => (
        <Card key={v._id} onClick={() => setSelected(v)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xl font-bold">{v.wort}</span>
              {v.kana && <span className="text-sm ml-2" style={{ color:"var(--accent-cyan)" }}>{v.kana}</span>}
              <p className="text-sm mt-0.5" style={{ color:"var(--text-secondary)" }}>{v.bedeutung}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {v.jlpt && <JlptBadge level={v.jlpt} />}
              {v.wortart && <span className="text-xs" style={{ color:"var(--text-secondary)" }}>{v.wortart}</span>}
            </div>
          </div>
        </Card>))}
    </div>
    {selected && <DetailModal onClose={() => setSelected(null)}><VokabelDetail v={selected} /></DetailModal>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function KanjiSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  const [selected, setSelected] = useState<unknown>(null);
  const filtered = items.filter((k: { jlpt?: string }) => !jlpt || k.jlpt === jlpt);
  if (filtered.length === 0) return <EmptyState tab="Kanji" />;
  return <>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {filtered.map((k: { _id: string; zeichen: string; bedeutung: string; onYomi?: string; kunYomi?: string; jlpt?: string }) => (
        <Card key={k._id} onClick={() => setSelected(k)}>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1" style={{ color:"var(--accent-pink)" }}>{k.zeichen}</div>
            <p className="text-sm font-medium">{k.bedeutung}</p>
            <div className="flex justify-center gap-2 mt-1 flex-wrap">
              {k.jlpt && <JlptBadge level={k.jlpt} />}
            </div>
            {k.onYomi && <p className="text-xs mt-1" style={{ color:"var(--text-secondary)" }}>音: {k.onYomi}</p>}
            {k.kunYomi && <p className="text-xs" style={{ color:"var(--text-secondary)" }}>訓: {k.kunYomi}</p>}
          </div>
        </Card>))}
    </div>
    {selected && <DetailModal onClose={() => setSelected(null)}><KanjiDetail k={selected} /></DetailModal>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GrammatikSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  const [selected, setSelected] = useState<unknown>(null);
  const filtered = items.filter((g: { jlpt?: string }) => !jlpt || g.jlpt === jlpt);
  if (filtered.length === 0) return <EmptyState tab="Grammatik" />;
  return <>
    <div className="flex flex-col gap-3">
      {filtered.map((g: { _id: string; muster: string; bedeutung: string; struktur?: string; jlpt?: string }) => (
        <Card key={g._id} onClick={() => setSelected(g)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="font-bold text-lg">{g.muster}</span>
              <p className="text-sm mt-0.5" style={{ color:"var(--text-secondary)" }}>{g.bedeutung}</p>
              {g.struktur && <p className="text-xs mt-1 font-mono" style={{ color:"var(--accent-cyan)" }}>{g.struktur}</p>}
            </div>
            {g.jlpt && <JlptBadge level={g.jlpt} />}
          </div>
        </Card>))}
    </div>
    {selected && <DetailModal onClose={() => setSelected(null)}><GrammatikDetail g={selected} /></DetailModal>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PartikelSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  const [selected, setSelected] = useState<unknown>(null);
  const filtered = items.filter((p: { jlpt?: string }) => !jlpt || p.jlpt === jlpt);
  if (filtered.length === 0) return <EmptyState tab="Partikel" />;
  return <>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {filtered.map((p: { _id: string; partikel: string; funktion: string; jlpt?: string }) => (
        <Card key={p._id} onClick={() => setSelected(p)}>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1" style={{ color:"var(--accent-pink)" }}>{p.partikel}</div>
            <p className="text-sm" style={{ color:"var(--text-secondary)" }}>{p.funktion}</p>
            {p.jlpt && <div className="flex justify-center mt-2"><JlptBadge level={p.jlpt} /></div>}
          </div>
        </Card>))}
    </div>
    {selected && <DetailModal onClose={() => setSelected(null)}><PartikelDetail p={selected} /></DetailModal>}
  </>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SatzSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  const [selected, setSelected] = useState<unknown>(null);
  const filtered = items.filter((s: { jlpt?: string }) => !jlpt || s.jlpt === jlpt);
  if (filtered.length === 0) return <EmptyState tab="Sätze" />;
  return <>
    <div className="flex flex-col gap-3">
      {filtered.map((s: { _id: string; japanisch: string; kana?: string; deutsch: string; jlpt?: string }) => (
        <Card key={s._id} onClick={() => setSelected(s)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium">{s.japanisch}</p>
              {s.kana && <p className="text-xs italic mt-0.5" style={{ color:"var(--accent-cyan)" }}>{s.kana}</p>}
              <p className="text-sm mt-1" style={{ color:"var(--text-secondary)" }}>{s.deutsch}</p>
            </div>
            {s.jlpt && <JlptBadge level={s.jlpt} />}
          </div>
        </Card>))}
    </div>
    {selected && <DetailModal onClose={() => setSelected(null)}><SatzDetail s={selected} /></DetailModal>}
  </>
}

// ─── Search results ───────────────────────────────────────────────────────────

interface SearchResult { _id: string; wort: string; kana: string; bedeutung: string; jlpt: string; typ: string }

function SearchResults({ results }: { results: Record<string, SearchResult[]> }) {
  const TYPE_LABEL: Record<string, string> = { vokabel:"Vokabel", kanji:"Kanji", grammatik:"Grammatik", partikel:"Partikel", satz:"Satz" };
  const all = Object.entries(results).flatMap(([, items]) => items);
  if (all.length === 0) return <p className="text-center py-8" style={{ color:"var(--text-secondary)" }}>Keine Ergebnisse gefunden.</p>;
  return (
    <div className="flex flex-col gap-3">
      {all.map(r => (
        <div key={r._id} className="glass rounded-xl p-4 flex items-center gap-4" style={{ border:"1px solid var(--border)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">{r.wort}</span>
              {r.kana && <span className="text-sm italic" style={{ color:"var(--accent-cyan)" }}>{r.kana}</span>}
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(0,212,255,0.08)", color:"var(--accent-cyan)" }}>{TYPE_LABEL[r.typ] ?? r.typ}</span>
              {r.jlpt && <JlptBadge level={r.jlpt} />}
            </div>
            <p className="text-sm mt-0.5" style={{ color:"var(--text-secondary)" }}>{r.bedeutung}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NotizenSection({ items, jlpt }: { items: any[]; jlpt: JLPT | null }) {
  const [selected, setSelected] = useState<unknown>(null);
  const TYPE_EMOJI: Record<string, string> = { vokabel:'📝', kanji:'漢', grammatik:'🔤', partikel:'🔗', satz:'💬', sonstiges:'📋' };
  const filtered = items.filter((n: { jlpt?: string }) => !jlpt || n.jlpt === jlpt);
  if (filtered.length === 0) return <EmptyState tab="Lektionen" />;
  return (
    <>
    <div className="flex flex-col gap-3">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {filtered.map((n: any) => (
        <Card key={n._id} onClick={() => setSelected(n)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{TYPE_EMOJI[n.typ] ?? '📋'}</span>
              <h3 className="font-bold text-base">{n.titel}</h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {n.jlpt && <JlptBadge level={n.jlpt} />}
              {(n.tags ?? []).map((t: string) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(255,45,107,0.08)", color:"var(--accent-pink)" }}>#{t}</span>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
    {selected && (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <DetailModal onClose={() => setSelected(null)}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(() => { const n = selected as any; return <>
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TYPE_EMOJI[n.typ] ?? '📋'}</span>
              <h2 className="font-bold text-xl">{n.titel}</h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {n.jlpt && <JlptBadge level={n.jlpt} />}
              {(n.tags ?? []).map((t: string) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(255,45,107,0.08)", color:"var(--accent-pink)" }}>#{t}</span>
              ))}
            </div>
          </div>
          {n.inhalt && <MarkdownContent content={n.inhalt} />}
        </> })()}
      </DetailModal>
    )}
    </>
  );
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lessons: any[]; vokabeln: any[]; kanji: any[]; grammatik: any[]; partikel: any[]; saetze: any[]; notizen: any[];
}

export default function JapanischClient({ lessons, vokabeln, kanji, grammatik, partikel, saetze, notizen }: Props) {
  const [tab, setTab] = useState<Tab>("lektionen");
  const [jlpt, setJlpt] = useState<JLPT | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Record<string, SearchResult[]> | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 1) { setSearchResults(null); return; }
    setSearching(true);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      fetch(`/api/japanisch-search?q=${encodeURIComponent(query.trim())}`)
        .then(r => r.json())
        .then(data => { setSearchResults(data); setSearching(false); })
        .catch(() => setSearching(false));
    }, 300);
  }, [query]);

  const counts: Record<Tab, number> = {
    lektionen: lessons.length, vokabel: vokabeln.length, kanji: kanji.length,
    grammatik: grammatik.length, partikel: partikel.length, satz: saetze.length, notizen: notizen.length,
  };

  return (
    <div className="min-h-screen pt-14 max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <GraduationCap size={28} style={{ color:"var(--accent-cyan)" }} />
        <h1 className="text-3xl font-bold">Japanisch lernen</h1>
      </div>
      <p className="mb-6" style={{ color:"var(--text-secondary)" }}>
        Lektionen, Vokabeln, Kanji, Grammatik und mehr — gesammelt auf meiner Reise.
      </p>

      {/* Hiragana strip */}
      <div className="mb-8 p-4 rounded-2xl text-center" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
        <p className="text-xs mb-2" style={{ color:"var(--text-secondary)" }}>Hiragana</p>
        <p className="text-xl tracking-widest" style={{ color:"var(--accent-pink)", fontWeight:300 }}>あいうえお　かきくけこ　さしすせそ</p>
        <p className="text-xl tracking-widest mt-1" style={{ color:"var(--accent-cyan)", fontWeight:300 }}>たちつてと　なにぬねの　はひふへほ</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-secondary)" }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Suchen über alle Typen... (z.B. 食べる, essen, は)"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none"
          style={{ background:"var(--bg-card)", border:"1px solid var(--border)", color:"var(--text-primary)" }}
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-secondary)" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search results */}
      {query.trim().length > 0 ? (
        <div>
          <p className="text-sm mb-4 flex items-center gap-2" style={{ color:"var(--text-secondary)" }}>
            <Search size={13} />
            {searching ? "Suche..." : `Ergebnisse für „${query}"`}
          </p>
          {!searching && searchResults && <SearchResults results={searchResults} />}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all flex-1 justify-center"
                style={{ background: tab === t.id ? "var(--accent-cyan)" : "transparent", color: tab === t.id ? "#0d1117" : "var(--text-secondary)", fontWeight: tab === t.id ? 600 : 400 }}>
                <span>{t.emoji}</span>
                <span className="hidden sm:inline">{t.label}</span>
                {counts[t.id] > 0 && (
                  <span className="text-xs rounded-full px-1.5" style={{ background: tab === t.id ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)" }}>
                    {counts[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* JLPT filter */}
          <JlptFilter active={jlpt} onChange={setJlpt} />

          {/* Content */}
          {tab === "lektionen" && <LektionenSection items={lessons} jlpt={jlpt} />}
          {tab === "vokabel"   && <VokabelSection   items={vokabeln} jlpt={jlpt} />}
          {tab === "kanji"     && <KanjiSection     items={kanji}    jlpt={jlpt} />}
          {tab === "grammatik" && <GrammatikSection items={grammatik} jlpt={jlpt} />}
          {tab === "partikel"  && <PartikelSection  items={partikel} jlpt={jlpt} />}
          {tab === "satz"      && <SatzSection      items={saetze}   jlpt={jlpt} />}
          {tab === "notizen"   && <NotizenSection   items={notizen}  jlpt={jlpt} />}

          {/* Coming soon */}
          <div className="mt-10 p-6 rounded-2xl text-center" style={{ background:"var(--bg-card)", border:"1px dashed var(--border)" }}>
            <BookOpen size={24} className="mx-auto mb-2" style={{ color:"var(--text-secondary)" }} />
            <p className="font-medium">Mehr Inhalte kommen laufend dazu</p>
            <p className="text-sm mt-1" style={{ color:"var(--text-secondary)" }}>Ich lerne selbst jeden Tag und teile es hier.</p>
          </div>
        </>
      )}
    </div>
  );
}
