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

// Freigegebene Kommentare zu einem Post holen
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) return NextResponse.json([])
  try {
    const comments = await client.fetch(
      `*[_type == "postComment" && postId == $postId && approved == true] | order(createdAt asc)[0...100] { _id, name, message, createdAt }`,
      { postId },
      { next: { revalidate: 15 } }
    )
    return NextResponse.json(comments ?? [])
  } catch {
    return NextResponse.json([])
  }
}

// Neuen Kommentar (moderiert)
export async function POST(req: NextRequest) {
  try {
    const { postId, postTitle, name, message } = await req.json()
    if (!postId || !name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Fehlende Felder.' }, { status: 400 })
    }
    await writeClient.create({
      _type: 'postComment',
      postId: String(postId).slice(0, 200),
      postTitle: postTitle ? String(postTitle).slice(0, 200) : undefined,
      name: name.trim().slice(0, 40),
      message: message.trim().slice(0, 1000),
      approved: false,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
