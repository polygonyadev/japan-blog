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
    const { name, message, kategorie } = await req.json()
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name und Nachricht sind pflicht.' }, { status: 400 })
    }
    await writeClient.create({
      _type: 'community',
      name: name.trim().slice(0, 50),
      message: message.trim().slice(0, 1000),
      kategorie: kategorie ?? 'allgemein',
      approved: false,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
