'use client'
import { useState, useCallback } from 'react'
import { useClient } from 'sanity'

interface ParsedDoc {
  _type: string
  [key: string]: unknown
}

interface ImportResult {
  file: string
  status: 'ok' | 'error'
  message: string
}

interface Preview {
  file: string
  doc: ParsedDoc | null
  raw: string
  hasFrontmatter: boolean
  manualType?: string
}

const TYPES = [
  { value: 'grammatik', label: '🔤 Grammatik' },
  { value: 'kanji',     label: '漢 Kanji' },
  { value: 'vokabel',   label: '📝 Vokabel' },
  { value: 'partikel',  label: '🔗 Partikel' },
  { value: 'satz',      label: '💬 Satz' },
  { value: 'lesson',    label: '📚 Lektion' },
  { value: 'notiz',     label: '📋 Notiz' },
]

const TYP_EMOJI: Record<string, string> = {
  grammatik: '🔤', kanji: '漢', vokabel: '📝', partikel: '🔗', satz: '💬', lesson: '📚', notiz: '📋',
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string; hasFrontmatter: boolean } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/)
  if (!match) return { data: {}, content: raw, hasFrontmatter: false }
  const data: Record<string, string> = {}
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':')
    if (key && rest.length) data[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '')
  })
  return { data, content: match[2].trim(), hasFrontmatter: true }
}

function cleanBody(content: string): string {
  return content
    .replace(/<!--SR:[^>]*-->/g, '')
    .replace(/#flashcards\/\S+/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, alias) => alias ?? link)
    .replace(/<%[^%]*%>/g, '')
    .replace(/> \[!.*?\]\s*/g, '> ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function mapToSanity(data: Record<string, string>, content: string, filename: string, overrideType?: string): ParsedDoc | null {
  const typ = (overrideType || data.typ)?.toLowerCase()
  const jlpt = data.jlpt?.trim() || undefined
  const markdown = cleanBody(content)
  const title = filename.replace(/_/g, ' ')

  switch (typ) {
    case 'grammatik':
      return { _type: 'grammatik', muster: data.muster || title, bedeutung: data.bedeutung || '', jlpt, markdown }
    case 'kanji':
      return { _type: 'kanji', zeichen: data.kanji || title, bedeutung: data.bedeutung || '', onYomi: data.on_yomi || '', kunYomi: data.kun_yomi || '', radikal: data.radikal || '', strichanzahl: data.strichanzahl ? parseInt(data.strichanzahl) : undefined, jlpt, markdown }
    case 'vokabel':
      return { _type: 'vokabel', wort: data.wort || title, kana: data.kana || '', bedeutung: data.bedeutung || '', wortart: data.wortart || '', jlpt, markdown }
    case 'partikel':
      return { _type: 'partikel', partikel: data.partikel || title, funktion: data.bedeutung || '', jlpt, markdown }
    case 'satz':
      return { _type: 'satz', japanisch: data.japanisch || title, kana: data.kana || '', deutsch: data.deutsch || '', jlpt, markdown }
    case 'lesson':
      return { _type: 'lesson', title, jlpt, description: data.bedeutung || '', phrases: [] }
    case 'notiz':
      return { _type: 'notiz', titel: title, typ: 'sonstiges', jlpt, inhalt: markdown }
    default:
      return null
  }
}

export function ImportTool() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [previews, setPreviews] = useState<Preview[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [dragging, setDragging] = useState(false)

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.name.endsWith('.md'))
    if (!fileArray.length) return
    setResults([])
    Promise.all(fileArray.map(file =>
      file.text().then(raw => {
        const { data, content, hasFrontmatter } = parseFrontmatter(raw)
        const doc = hasFrontmatter && data.typ ? mapToSanity(data, content, file.name.replace('.md', '')) : null
        return { file: file.name, doc, raw, hasFrontmatter, content, data } as Preview & { content: string; data: Record<string, string> }
      })
    )).then(setPreviews as (v: (Preview & { content: string; data: Record<string, string> })[]) => void)
  }, [])

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  function setManualType(filename: string, typ: string) {
    setPreviews(prev => prev.map(p => {
      if (p.file !== filename) return p
      const { data, content } = parseFrontmatter(p.raw)
      const doc = mapToSanity(data, cleanBody(content) ? cleanBody(content) : p.raw, filename.replace('.md', ''), typ)
      return { ...p, manualType: typ, doc }
    }))
  }

  function removePreview(filename: string) {
    setPreviews(p => p.filter(x => x.file !== filename))
  }

  async function importAll() {
    setImporting(true)
    const newResults: ImportResult[] = []
    for (const p of previews) {
      if (!p.doc) {
        newResults.push({ file: p.file, status: 'error', message: 'Kein Typ ausgewählt' })
        continue
      }
      try {
        await client.create(p.doc)
        newResults.push({ file: p.file, status: 'ok', message: `${p.doc._type} erfolgreich erstellt` })
      } catch (err: unknown) {
        newResults.push({ file: p.file, status: 'error', message: err instanceof Error ? err.message : 'Fehler' })
      }
    }
    setResults(newResults)
    setPreviews([])
    setImporting(false)
  }

  const JLPT_COLOR: Record<string, string> = { N5: '#00d4ff', N4: '#66e0a0', N3: '#ffd166', N2: '#ff9944', N1: '#ff2d6b' }
  const TYPE_COLOR: Record<string, string> = { grammatik: '#7c4dff', kanji: '#ff2d6b', vokabel: '#0099cc', partikel: '#ff9944', satz: '#2e7d32', lesson: '#00b894', notiz: '#888' }

  const s = {
    wrap:    { padding: '2rem', maxWidth: '860px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
    h1:      { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' } as React.CSSProperties,
    sub:     { color: '#888', marginBottom: '1.5rem', fontSize: '0.875rem' } as React.CSSProperties,
    dropzone:{ border: `2px dashed ${dragging ? '#0099cc' : '#ccc'}`, borderRadius: '12px', padding: '2.5rem', textAlign: 'center' as const, cursor: 'pointer', background: dragging ? '#e8f7ff' : '#fafafa', transition: 'all 0.2s' },
    btn:     { padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' } as React.CSSProperties,
    card:    { border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem', background: '#fff' } as React.CSSProperties,
    badge:   (color: string) => ({ background: color + '22', color, border: `1px solid ${color}55`, borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }),
    ok:      { color: '#2e7d32', background: '#e8f5e9', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.875rem' } as React.CSSProperties,
    err:     { color: '#c62828', background: '#ffebee', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.875rem' } as React.CSSProperties,
    select:  { padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.8rem', background: '#fff', cursor: 'pointer' } as React.CSSProperties,
  }

  const needsType = previews.filter(p => !p.doc).length
  const readyCount = previews.filter(p => p.doc).length

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>📥 Obsidian Import</h1>
      <p style={s.sub}>Ziehe <code>.md</code> Dateien aus deinem Obsidian Vault rein — aus allen Ordnern (Grammatik, Kanji, Vokabeln, Partikel, Sätze). Dateien ohne Frontmatter kannst du manuell zuordnen.</p>

      {/* Drop zone */}
      <div style={s.dropzone}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('md-file-input')?.click()}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Dateien hier ablegen</div>
        <div style={{ fontSize: '0.875rem', color: '#888' }}>oder klicken — mehrere .md Dateien möglich</div>
        <input id="md-file-input" type="file" accept=".md" multiple style={{ display: 'none' }} onChange={onFileInput} />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {previews.length} Datei{previews.length > 1 ? 'en' : ''} geladen
              </h2>
              {needsType > 0 && (
                <p style={{ fontSize: '0.8rem', color: '#e65100', margin: '0.25rem 0 0' }}>
                  ⚠️ {needsType} Datei{needsType > 1 ? 'en benötigen' : ' benötigt'} eine Typ-Auswahl
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ ...s.btn, background: '#f0f0f0' }} onClick={() => setPreviews([])}>Abbrechen</button>
              <button
                style={{ ...s.btn, background: readyCount > 0 ? '#0099cc' : '#ccc', color: '#fff', opacity: importing ? 0.6 : 1 }}
                onClick={importAll}
                disabled={importing || readyCount === 0}>
                {importing ? 'Importiere...' : `${readyCount} importieren`}
              </button>
            </div>
          </div>

          {previews.map(p => {
            const typ = p.doc?._type
            const color = typ ? (TYPE_COLOR[typ] ?? '#888') : '#e65100'
            return (
              <div key={p.file} style={s.card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{typ ? TYP_EMOJI[typ] : '❓'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{p.file}</span>
                      {typ && <span style={s.badge(color)}>{typ}</span>}
                      {p.doc && (p.doc.jlpt as string) && <span style={s.badge(JLPT_COLOR[p.doc.jlpt as string] ?? '#888')}>{p.doc.jlpt as string}</span>}
                      {!p.hasFrontmatter && <span style={s.badge('#e65100')}>Kein Frontmatter</span>}
                    </div>

                    {/* Preview of main field */}
                    {p.doc && (
                      <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>
                        {typ === 'grammatik' && `Muster: ${p.doc.muster}`}
                        {typ === 'kanji'     && `Zeichen: ${p.doc.zeichen} · ${p.doc.bedeutung}`}
                        {typ === 'vokabel'   && `Wort: ${p.doc.wort} (${p.doc.kana}) · ${p.doc.bedeutung}`}
                        {typ === 'partikel'  && `Partikel: ${p.doc.partikel} · ${p.doc.funktion}`}
                        {typ === 'satz'      && `${p.doc.japanisch} · ${p.doc.deutsch}`}
                        {typ === 'notiz'     && `Notiz: ${p.doc.titel}`}
                      </div>
                    )}

                    {/* Manual type selector if no frontmatter or unknown type */}
                    {(!p.hasFrontmatter || !p.doc) && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Typ wählen:</span>
                        {TYPES.map(t => (
                          <button key={t.value}
                            style={{ ...s.btn, padding: '0.2rem 0.6rem', background: p.manualType === t.value ? TYPE_COLOR[t.value] + '33' : '#f5f5f5', color: p.manualType === t.value ? TYPE_COLOR[t.value] : '#555', border: `1px solid ${p.manualType === t.value ? TYPE_COLOR[t.value] : '#ddd'}`, fontWeight: p.manualType === t.value ? 700 : 400 }}
                            onClick={() => setManualType(p.file, t.value)}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button style={{ ...s.btn, background: '#fff0f0', color: '#c62828', padding: '0.25rem 0.75rem', flexShrink: 0 }}
                    onClick={() => removePreview(p.file)}>✕</button>
                </div>
              </div>
            )
          })}
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
          <button style={{ ...s.btn, background: '#0099cc', color: '#fff', marginTop: '1rem' }} onClick={() => setResults([])}>
            Weitere Dateien importieren
          </button>
        </div>
      )}
    </div>
  )
}
