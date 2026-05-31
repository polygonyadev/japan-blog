import { NextResponse } from 'next/server'
import { getGalleryImages } from '@/lib/fetchData'

export async function GET() {
  const images = await getGalleryImages()
  return NextResponse.json(images)
}
