import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Antwort an einen Gästebuch-Eintrag anhängen (moderiert)
export async function POST(req: NextRequest) {
  try {
    const { entryId, name, message } = await req.json()
    if (!entryId || !name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Fehlende Felder.' }, { status: 400 })
    }
    await writeClient
      .patch(entryId)
      .setIfMissing({ antworten: [] })
      .append('antworten', [{
        _key: Math.random().toString(36).slice(2),
        name: name.trim().slice(0, 40),
        message: message.trim().slice(0, 280),
        createdAt: new Date().toISOString(),
        approved: false,
      }])
      .commit()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
