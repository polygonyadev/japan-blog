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

const GAMES = ['snake', 'pong']

// Top-10 Highscores für ein Spiel
export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get('game')
  if (!game || !GAMES.includes(game)) return NextResponse.json([])
  try {
    const scores = await client.fetch(
      `*[_type == "highscore" && game == $game] | order(score desc, createdAt asc)[0...10] { _id, name, score }`,
      { game },
      { next: { revalidate: 10 } }
    )
    return NextResponse.json(scores ?? [])
  } catch {
    return NextResponse.json([])
  }
}

// Neuen Highscore speichern (direkt sichtbar)
export async function POST(req: NextRequest) {
  try {
    const { game, name, score } = await req.json()
    if (!GAMES.includes(game) || typeof score !== 'number' || !name?.trim()) {
      return NextResponse.json({ error: 'Ungültige Daten.' }, { status: 400 })
    }
    await writeClient.create({
      _type: 'highscore',
      game,
      name: name.trim().slice(0, 16),
      score: Math.max(0, Math.min(999999, Math.floor(score))),
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
