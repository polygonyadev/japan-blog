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
    const { email, name } = await req.json()
    const clean = email?.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 })
    }

    // Already in the list?
    const existing: { _id: string; unsubscribed?: boolean }[] = await writeClient.fetch(
      `*[_type == "newsletter" && email == $email]{ _id, unsubscribed }`,
      { email: clean }
    )

    if (existing.length > 0) {
      // Reactivate any unsubscribed entries instead of creating a duplicate
      const now = new Date().toISOString()
      await Promise.all(existing
        .filter(e => e.unsubscribed)
        .map(e => writeClient.patch(e._id).set({ unsubscribed: false, subscribedAt: now }).commit()))
      return NextResponse.json({ ok: true })
    }

    await writeClient.create({
      _type: 'newsletter',
      email: clean,
      name: name?.trim() || '',
      subscribedAt: new Date().toISOString(),
      unsubscribed: false,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
