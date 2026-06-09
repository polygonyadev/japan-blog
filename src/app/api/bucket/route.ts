import { NextResponse } from 'next/server'
import { getBucketItems } from '@/lib/fetchData'

export async function GET() {
  try {
    return NextResponse.json(await getBucketItems())
  } catch {
    return NextResponse.json([])
  }
}
