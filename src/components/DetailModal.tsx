"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

export function DetailModal({ onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[998] flex items-start justify-center pt-8 px-4 pb-8"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl glass"
        style={{ border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-all hover:scale-110 z-10"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
          <X size={16} />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Markdown renderer used inside modals
export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: (p) => <div className="overflow-x-auto my-3"><table className="w-full text-sm border-collapse" {...p} /></div>,
        thead: (p) => <thead {...p} />,
        th: (p) => <th className="text-left py-2 pr-4 text-xs font-semibold" style={{ borderBottom: "2px solid var(--border)", color: "var(--accent-cyan)" }} {...p} />,
        td: (p) => <td className="py-1.5 pr-4 text-sm" style={{ borderBottom: "1px solid var(--border)" }} {...p} />,
        code: ({ children, className, ...p }) => {
          const isBlock = String(children).includes('\n');
          return isBlock
            ? <pre className="p-3 rounded-xl text-xs overflow-x-auto my-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}><code {...p}>{children}</code></pre>
            : <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "var(--bg-card)", color: "var(--accent-cyan)" }} {...p}>{children}</code>;
        },
        h1: (p) => <h1 className="text-xl font-bold mt-5 mb-2" {...p} />,
        h2: (p) => <h2 className="text-base font-bold mt-5 mb-2 pb-1" style={{ borderBottom: "1px solid var(--border)", color: "var(--accent-cyan)" }} {...p} />,
        h3: (p) => <h3 className="text-sm font-semibold mt-4 mb-1" {...p} />,
        p:  (p) => <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }} {...p} />,
        strong: (p) => <strong className="font-bold" style={{ color: "var(--text-primary)" }} {...p} />,
        em: (p) => <em className="italic" style={{ color: "var(--accent-cyan)" }} {...p} />,
        ul: (p) => <ul className="list-disc list-inside text-sm mb-3 space-y-1" style={{ color: "var(--text-secondary)" }} {...p} />,
        ol: (p) => <ol className="list-decimal list-inside text-sm mb-3 space-y-1" style={{ color: "var(--text-secondary)" }} {...p} />,
        blockquote: (p) => <blockquote className="pl-3 my-3 text-sm italic" style={{ borderLeft: "3px solid var(--accent-cyan)", color: "var(--text-secondary)" }} {...p} />,
        hr: () => <hr style={{ borderColor: "var(--border)", margin: "1rem 0" }} />,
      }}>
      {content}
    </ReactMarkdown>
  );
}
