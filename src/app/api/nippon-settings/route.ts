import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

const DEFAULTS = {
  bannerText: '★ ようこそ！ NipponOS ★ Klicke auf ein Icon um ein Fenster zu öffnen ★ 日本大好き ★',
  systems: [
    { label: 'NipponOS', value: 'OK', color: 'green' },
    { label: 'Kamera', value: 'OK', color: 'green' },
    { label: 'Magen', value: 'VOLL', color: 'ochre' },
    { label: 'Heimweh', value: '12%', color: 'pink' },
  ],
}

export async function GET() {
  try {
    const s = await client.fetch(
      `*[_type == "nipponSettings"][0]{ bannerText, systems }`,
      {},
      { next: { revalidate: 30 } }
    )
    if (s) return NextResponse.json({ bannerText: s.bannerText || DEFAULTS.bannerText, systems: (s.systems?.length ? s.systems : DEFAULTS.systems) })
  } catch {}
  return NextResponse.json(DEFAULTS)
}
