import { NextRequest, NextResponse } from 'next/server'
import { searchJapanisch } from '@/lib/fetchData'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 1) return NextResponse.json({ vokabeln: [], kanji: [], grammatik: [], partikel: [], saetze: [] })
  const results = await searchJapanisch(q)
  return NextResponse.json(results)
}
