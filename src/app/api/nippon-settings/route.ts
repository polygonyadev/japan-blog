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
  photoOfDay: null as null | { url: string; caption?: string },
  videoOfDay: null as null | { id: string; title?: string },
  departureDate: null as null | string,
}

// Extrahiert die YouTube-Video-ID aus Link oder roher ID
function youtubeId(input?: string): string | null {
  if (!input) return null
  const s = input.trim()
  // bereits eine reine ID?
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export async function GET() {
  try {
    const res = await client.fetch(
      `{
        "nippon": *[_type == "nipponSettings"][0]{
          bannerText,
          systems,
          "photoUrl": photoOfDay.asset->url,
          "photoCaption": photoOfDay.caption,
          videoOfDay,
          videoOfDayTitle
        },
        "departureDate": *[_type == "siteSettings"][0].departureDate
      }`,
      {},
      { next: { revalidate: 30 } }
    )
    const s = res?.nippon
    const departureDate = res?.departureDate ?? null
    if (s || departureDate) {
      const vid = youtubeId(s?.videoOfDay)
      return NextResponse.json({
        bannerText: s?.bannerText || DEFAULTS.bannerText,
        systems: s?.systems?.length ? s.systems : DEFAULTS.systems,
        photoOfDay: s?.photoUrl ? { url: s.photoUrl, caption: s.photoCaption || undefined } : null,
        videoOfDay: vid ? { id: vid, title: s.videoOfDayTitle || undefined } : null,
        departureDate,
      })
    }
  } catch {}
  return NextResponse.json(DEFAULTS)
}
