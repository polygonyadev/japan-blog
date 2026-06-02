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
    const { email } = await req.json()
    const clean = email?.trim().toLowerCase()
    if (!clean || !clean.includes('@')) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 })
    }

    // Find all active subscriptions with this email
    const docs: { _id: string }[] = await writeClient.fetch(
      `*[_type == "newsletter" && email == $email && unsubscribed != true]{ _id }`,
      { email: clean }
    )

    if (docs.length === 0) {
      // Don't reveal whether the email exists — just confirm
      return NextResponse.json({ ok: true, notFound: true })
    }

    const now = new Date().toISOString()
    await Promise.all(docs.map(d =>
      writeClient.patch(d._id).set({ unsubscribed: true, unsubscribedAt: now }).commit()
    ))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Abmelden.' }, { status: 500 })
  }
}
