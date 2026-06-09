import { NextResponse } from 'next/server'
import { getLessons, getVokabeln, getKanji, getGrammatik, getPartikel, getSaetze, getNotizen } from '@/lib/fetchData'

export async function GET() {
  try {
    const [lessons, vokabeln, kanji, grammatik, partikel, saetze, notizen] = await Promise.all([
      getLessons(), getVokabeln(), getKanji(), getGrammatik(), getPartikel(), getSaetze(), getNotizen(),
    ])
    return NextResponse.json({ lessons, vokabeln, kanji, grammatik, partikel, saetze, notizen })
  } catch {
    return NextResponse.json({ lessons: [], vokabeln: [], kanji: [], grammatik: [], partikel: [], saetze: [], notizen: [] })
  }
}
