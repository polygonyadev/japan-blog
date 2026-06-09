import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { client } from '@/sanity/lib/client'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// Freigegebene Einträge holen
export async function GET() {
  try {
    const entries = await client.fetch(
      `*[_type == "guestbook" && approved == true] | order(createdAt desc)[0...50] { _id, name, message, createdAt }`,
      {},
      { next: { revalidate: 20 } }
    )
    return NextResponse.json(entries ?? [])
  } catch {
    return NextResponse.json([])
  }
}

// Neuen Eintrag (moderiert)
export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json()
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name und Nachricht sind pflicht.' }, { status: 400 })
    }
    await writeClient.create({
      _type: 'guestbook',
      name: name.trim().slice(0, 40),
      message: message.trim().slice(0, 280),
      approved: false,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
