import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
    const { postId, name, message } = await req.json()
    if (!postId || !name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Fehlende Felder.' }, { status: 400 })
    }

    // Append reply to the community document's antworten array
    await writeClient
      .patch(postId)
      .setIfMissing({ antworten: [] })
      .append('antworten', [{
        _key: Math.random().toString(36).slice(2),
        name: name.trim().slice(0, 50),
        message: message.trim().slice(0, 1000),
        createdAt: new Date().toISOString(),
        approved: false,
      }])
      .commit()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
