import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { allGalleryImagesQuery } from '@/sanity/lib/queries'

export async function GET() {
  try {
    const data = await client.fetch(allGalleryImagesQuery)
    const { postPhotos = [], standalonePhotos = [] } = data ?? {}

    // Flatten post photos — each photo from each post becomes one item
    const fromPosts = postPhotos.flatMap((post: {
      slug: string; title: string; location?: string; tags?: string[];
      images: { url: string; caption?: string }[]
    }) =>
      (post.images ?? []).map((img: { url: string; caption?: string }) => ({
        url: img.url,
        caption: img.caption,
        title: post.title,
        location: post.location,
        tags: post.tags,
        slug: post.slug,
      }))
    )

    // Standalone gallery photos
    const standalone = standalonePhotos.map((p: {
      _id: string; url: string; caption?: string; location?: string; tags?: string[]
    }) => ({
      url: p.url,
      caption: p.caption,
      location: p.location,
      tags: p.tags,
    }))

    return NextResponse.json([...standalone, ...fromPosts])
  } catch {
    return NextResponse.json([])
  }
}
