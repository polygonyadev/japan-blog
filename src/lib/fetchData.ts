import { client } from '@/sanity/lib/client'
import { allPostsQuery, allLessonsQuery, postBySlugQuery, allBucketItemsQuery, allGalleryImagesQuery, siteSettingsQuery, statsQuery } from '@/sanity/lib/queries'
import { POSTS, type Post } from '@/lib/data'

export async function getPosts(): Promise<Post[]> {
  try {
    const data = await client.fetch(allPostsQuery, {}, { next: { revalidate: 60 } })
    if (data && data.length > 0) return data
  } catch {
    // fall back to local data
  }
  return POSTS
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const data = await client.fetch(postBySlugQuery, { slug }, { next: { revalidate: 60 } })
    if (data) return data
  } catch {}
  return POSTS.find(p => p.slug === slug)
}

export async function getLessons() {
  try {
    const data = await client.fetch(allLessonsQuery, {}, { next: { revalidate: 60 } })
    if (data && data.length > 0) return data
  } catch {}
  return []
}

export async function getBucketItems() {
  try {
    const data = await client.fetch(allBucketItemsQuery, {}, { next: { revalidate: 60 } })
    if (data) return data
  } catch {}
  return []
}

export async function getGalleryImages() {
  try {
    const data = await client.fetch(allGalleryImagesQuery, {}, { next: { revalidate: 60 } })
    if (data) return data
  } catch {}
  return []
}

export async function getSiteSettings() {
  try {
    const data = await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } })
    if (data) return data
  } catch {}
  return { statusText: 'Gerade in Japan 🇯🇵', showStatus: true, departureDate: null }
}

export async function getStats() {
  try {
    const data = await client.fetch(statsQuery, {}, { next: { revalidate: 60 } })
    if (data) return data
  } catch {}
  return { postsCount: 0, citiesCount: 0, photosCount: 0 }
}
