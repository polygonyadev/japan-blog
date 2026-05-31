import { client } from '@/sanity/lib/client'
import { allPostsQuery, allLessonsQuery, postBySlugQuery } from '@/sanity/lib/queries'
import { POSTS, BUCKET_LIST, type Post } from '@/lib/data'

export async function getPosts(): Promise<Post[]> {
  try {
    const data = await client.fetch(allPostsQuery, {}, { next: { revalidate: 60 } })
    if (data && data.length > 0) return data
  } catch {
    // Sanity not reachable or empty — fall back to local data
  }
  return POSTS
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const data = await client.fetch(postBySlugQuery, { slug }, { next: { revalidate: 60 } })
    if (data) return data
  } catch {
    // fall back
  }
  return POSTS.find(p => p.slug === slug)
}

export async function getLessons() {
  try {
    const data = await client.fetch(allLessonsQuery, {}, { next: { revalidate: 60 } })
    if (data && data.length > 0) return data
  } catch {
    // fall back to empty — lessons come from Sanity only
  }
  return []
}

export { BUCKET_LIST }
