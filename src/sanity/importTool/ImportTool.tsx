'use client'
import { useState, useCallback } from 'react'
import { useClient } from 'sanity'

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedDoc {
  _type: string
  [key: string]: unknown
}

interface ImportResult {
  file: string
  status: 'ok' | 'error'
  message: string
}

// ── Frontmatter parser (no external deps needed in studio context) ────────────

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/)
  if (!match) return { data: {}, content: raw }
  const data: Record<string, string> = {}
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':')
    if (key && rest.length) data[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '')
  })
  return { data, content: match[2].trim() }
}

// Strip Obsidian-specific stuff from markdown body
function cleanBody(content: string): string {
  return content
    .replace(/<!--SR:[^>]*-->/g, '')          // spaced repetition metadata
    .replace(/#flashcards\/\S+/g, '')          // flashcard tags
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, alias) => alias ?? link) // wiki links
    .replace(/<%[^%]*%>/g, '')                 // templater placeholders
    .replace(/\n{3,}/g, '\n\n')               // multiple blank lines
    .trim()
}

// ── Map parsed frontmatter → Sanity document ─────────────────────────────────

function mapToSanity(data: Record<string, string>, content: string, filename: string): ParsedDoc | null {
  const typ = data.typ?.toLowerCase()
  const jlpt = data.jlpt?.trim() || undefined
  const markdown = cleanBody(content)

  switch (typ) {
    case 'grammatik':
      return {
        _type: 'grammatik',
        muster: data.muster || filename,
        bedeutung: data.bedeutung || '',
        jlpt,
        markdown,
      }
    case 'kanji':
      return {
        _type: 'kanji',
        zeichen: data.kanji || filename,
        bedeutung: data.bedeutung || '',
        onYomi: data.on_yomi || '',
        kunYomi: data.kun_yomi || '',
        radikal: data.radikal || '',
        strichanzahl: data.strichanzahl ? parseInt(data.strichanzahl) : undefined,
        jlpt,
        markdown,
      }
    case 'vokabel':
      return {
        _type: 'vokabel',
        wort: data.wort || filename,
        kana: data.kana || '',
        bedeutung: data.bedeutung || '',
        wortart: data.wortart || '',
        jlpt,
        markdown,
      }
    case 'partikel':
      return {
        _type: 'partikel',
        partikel: data.partikel || filename,
        funktion: data.bedeutung || '',
        jlpt,
        markdown,
      }
    case 'satz':
      return {
        _type: 'satz',
        japanisch: data.japanisch || filename,
        kana: data.kana || '',
        deutsch: data.deutsch || '',
        jlpt,
        markdown,
      }
    default:
      return null
  }
}

// ── UI ────────────────────────────────────────────────────────────────────────

const TYP_EMOJI: Record<string, string> = {
  grammatik: '🔤', kanji: '漢', vokabel: '📝', partikel: '🔗', satz: '💬',
}

export function ImportTool() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [previews, setPreviews] = useState<{ file: string; doc: ParsedDoc | null; raw: string }[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [dragging, setDragging] = useState(false)

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.name.endsWith('.md'))
    if (!fileArray.length) return
    setResults([])

    Promise.all(fileArray.map(file =>
      file.text().then(raw => {
        const { data, content } = parseFrontmatter(raw)
        const doc = mapToSanity(data, content, file.name.replace('.md', ''))
        return { file: file.name, doc, raw }
      })
    )).then(setPreviews)
  }, [])

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  function removePreview(filename: string) {
    setPreviews(p => p.filter(x => x.file !== filename))
  }

  async function importAll() {
    setImporting(true)
    const newResults: ImportResult[] = []
    for (const { file, doc } of previews) {
      if (!doc) {
        newResults.push({ file, status: 'error', message: 'Unbekannter Typ — nicht importiert' })
        continue
      }
      try {
        await client.create(doc)
        newResults.push({ file, status: 'ok', message: `${doc._type} erfolgreich erstellt` })
      } catch (err: unknown) {
        newResults.push({ file, status: 'error', message: err instanceof Error ? err.message : 'Fehler' })
      }
    }
    setResults(newResults)
    setPreviews([])
    setImporting(false)
  }

  // ── Styles (inline — studio has own CSS scope) ──
  const s = {
    wrap:    { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
    h1:      { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' } as React.CSSProperties,
    sub:     { color: '#888', marginBottom: '1.5rem', fontSize: '0.875rem' } as React.CSSProperties,
    dropzone:{ border: `2px dashed ${dragging ? '#0099cc' : '#ccc'}`, borderRadius: '12px', padding: '2.5rem', textAlign: 'center' as const, cursor: 'pointer', background: dragging ? '#e8f7ff' : '#fafafa', transition: 'all 0.2s' },
    btn:     { padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' } as React.CSSProperties,
    card:    { border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem', background: '#fff', display: 'flex', alignItems: 'flex-start', gap: '1rem' } as React.CSSProperties,
    badge:   (color: string) => ({ background: color + '22', color, border: `1px solid ${color}55`, borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }),
    field:   { fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' } as React.CSSProperties,
    ok:      { color: '#2e7d32', background: '#e8f5e9', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.875rem' } as React.CSSProperties,
    err:     { color: '#c62828', background: '#ffebee', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.875rem' } as React.CSSProperties,
  }

  const JLPT_COLOR: Record<string, string> = { N5: '#00d4ff', N4: '#66e0a0', N3: '#ffd166', N2: '#ff9944', N1: '#ff2d6b' }
  const TYPE_COLOR: Record<string, string> = { grammatik: '#7c4dff', kanji: '#ff2d6b', vokabel: '#0099cc', partikel: '#ff9944', satz: '#2e7d32' }

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>📥 Obsidian Import</h1>
      <p style={s.sub}>Ziehe eine oder mehrere <code>.md</code> Dateien aus deinem Obsidian Vault hier rein.</p>

      {/* Drop zone */}
      <div
        style={s.dropzone}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('md-file-input')?.click()}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Dateien hier ablegen</div>
        <div style={{ fontSize: '0.875rem', color: '#888' }}>oder klicken zum Auswählen — mehrere .md Dateien möglich</div>
        <input id="md-file-input" type="file" accept=".md" multiple style={{ display: 'none' }} onChange={onFileInput} />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
              {previews.length} Datei{previews.length > 1 ? 'en' : ''} bereit zum Import
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ ...s.btn, background: '#f0f0f0' }} onClick={() => setPreviews([])}>Abbrechen</button>
              <button
                style={{ ...s.btn, background: '#0099cc', color: '#fff', opacity: importing ? 0.6 : 1 }}
                onClick={importAll}
                disabled={importing}
              >
                {importing ? 'Importiere...' : `Alle ${previews.length} importieren`}
              </button>
            </div>
          </div>

          {previews.map(({ file, doc }) => (
            <div key={file} style={s.card}>
              <div style={{ fontSize: '1.5rem' }}>{doc ? TYP_EMOJI[doc._type] ?? '📋' : '❓'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>{file}</span>
                  {doc && (
                    <>
                      <span style={s.badge(TYPE_COLOR[doc._type] ?? '#888')}>{doc._type}</span>
                      {doc.jlpt && <span style={s.badge(JLPT_COLOR[doc.jlpt as string] ?? '#888')}>{doc.jlpt as string}</span>}
                    </>
                  )}
                  {!doc && <span style={s.badge('#c62828')}>Unbekannter Typ</span>}
                </div>
                {doc && (
                  <div style={s.field}>
                    {doc._type === 'grammatik' && `Muster: ${doc.muster} · ${doc.bedeutung}`}
                    {doc._type === 'kanji'     && `Zeichen: ${doc.zeichen} · ${doc.bedeutung}`}
                    {doc._type === 'vokabel'   && `Wort: ${doc.wort} (${doc.kana}) · ${doc.bedeutung}`}
                    {doc._type === 'partikel'  && `Partikel: ${doc.partikel} · ${doc.funktion}`}
                    {doc._type === 'satz'      && `${doc.japanisch} · ${doc.deutsch}`}
                  </div>
                )}
                {!doc && <div style={{ ...s.field, color: '#c62828' }}>Frontmatter-Typ nicht erkannt. Erwartet: grammatik, kanji, vokabel, partikel oder satz.</div>}
              </div>
              <button style={{ ...s.btn, background: '#fff0f0', color: '#c62828', padding: '0.25rem 0.75rem' }}
                onClick={() => removePreview(file)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ergebnis</h2>
          {results.map((r, i) => (
            <div key={i} style={r.status === 'ok' ? s.ok : s.err}>
              {r.status === 'ok' ? '✅' : '❌'} <strong>{r.file}</strong> — {r.message}
            </div>
          ))}
          <button style={{ ...s.btn, background: '#0099cc', color: '#fff', marginTop: '1rem' }}
            onClick={() => setResults([])}>
            Weitere Dateien importieren
          </button>
        </div>
      )}
    </div>
  )
}
