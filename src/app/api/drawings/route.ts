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

// Freigegebene Zeichnungen holen (Galerie)
export async function GET() {
  try {
    const drawings = await client.fetch(
      `*[_type == "drawing" && approved == true] | order(createdAt desc)[0...60] {
        _id, name, createdAt, "url": image.asset->url
      }`,
      {},
      { next: { revalidate: 20 } }
    )
    return NextResponse.json(drawings ?? [])
  } catch {
    return NextResponse.json([])
  }
}

// Neue Zeichnung hochladen (moderiert)
export async function POST(req: NextRequest) {
  try {
    const { name, dataUrl } = await req.json()
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Ungültiges Bild.' }, { status: 400 })
    }
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    // Größe begrenzen (~2 MB)
    if (buffer.length > 2_000_000) {
      return NextResponse.json({ error: 'Bild zu groß.' }, { status: 400 })
    }
    const asset = await writeClient.assets.upload('image', buffer, { filename: 'paint.png', contentType: 'image/png' })
    await writeClient.create({
      _type: 'drawing',
      name: (name?.trim() || 'Anonym').slice(0, 40),
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      approved: false,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
