"use client";
import { PortableText } from "@portabletext/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/components/LanguageProvider";

// Plaintext aus Portable-Text-Blöcken rekonstruieren (für Markdown-Erkennung)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blocksToText(value: any): string {
  if (!Array.isArray(value)) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return value.filter((b: any) => b?._type === "block")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => (b.children ?? []).map((c: any) => c.text ?? "").join("")).join("\n\n");
}
function looksLikeMarkdown(s: string): boolean {
  return /(\*\*[^*]+\*\*|(^|\n)\s*#{1,6}\s|(^|\n)\s*[-*]\s|(^|\n)\s*\d+\.\s)/.test(s);
}

const portableComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 leading-relaxed" style={{ color: "var(--text-primary)" }}>{children}</p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-bold mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-bold mt-6 mb-2">{children}</h3>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="pl-4 my-4 italic" style={{ borderLeft: "3px solid var(--accent-cyan)", color: "var(--text-secondary)" }}>
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    link: ({ value, children }: { value?: { href: string }; children?: React.ReactNode }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-cyan)" }} className="underline underline-offset-2">
        {children}
      </a>
    ),
  },
};

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentEN?: any;
  excerpt?: string;
  excerptEN?: string;
}

export default function PostContent({ content, contentEN, excerpt, excerptEN }: Props) {
  const { lang } = useLanguage();
  const useEN = lang === "en";
  const activeContent = (useEN && contentEN) ? contentEN : content;
  const activeExcerpt = (useEN && excerptEN) ? excerptEN : excerpt;
  const raw = blocksToText(activeContent);
  const isMarkdown = looksLikeMarkdown(raw);

  return (
    <div className="text-base leading-relaxed">
      {activeContent ? (
        isMarkdown ? (
          <div className="prose-headings:font-bold">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              h1: (p) => <h2 className="text-2xl font-bold mt-8 mb-3" {...p} />,
              h2: (p) => <h2 className="text-2xl font-bold mt-8 mb-3" {...p} />,
              h3: (p) => <h3 className="text-xl font-bold mt-6 mb-2" {...p} />,
              p: (p) => <p className="mb-4 leading-relaxed" style={{ color: "var(--text-primary)" }} {...p} />,
              strong: (p) => <strong className="font-bold" {...p} />,
              ul: (p) => <ul className="list-disc list-inside mb-4 space-y-1" {...p} />,
              ol: (p) => <ol className="list-decimal list-inside mb-4 space-y-1" {...p} />,
              blockquote: (p) => <blockquote className="pl-4 my-4 italic" style={{ borderLeft: "3px solid var(--accent-cyan)", color: "var(--text-secondary)" }} {...p} />,
              a: (p) => <a target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-cyan)" }} className="underline underline-offset-2" {...p} />,
            }}>{raw}</ReactMarkdown>
          </div>
        ) : (
          <PortableText value={activeContent} components={portableComponents as Parameters<typeof PortableText>[0]["components"]} />
        )
      ) : (
        <p style={{ color: "var(--text-secondary)" }}>{activeExcerpt}</p>
      )}
    </div>
  );
}
