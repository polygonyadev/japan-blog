import { groq } from 'next-sanity'

export const allPostsQuery = groq`
  *[_type == "post"] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    lat,
    lng,
    season,
    weather,
    excerpt,
    tags,
    youtubeId,
    "coverImage": coverImage.asset->url,
    "likes": 0
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    lat,
    lng,
    season,
    weather,
    excerpt,
    content,
    tags,
    youtubeId,
    "coverImage": coverImage.asset->url
  }
`

export const allLessonsQuery = groq`
  *[_type == "lesson"] | order(jlpt asc) {
    _id,
    title,
    description,
    emoji,
    jlpt,
    tags,
    phrases
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    statusText,
    showStatus,
    departureDate
  }
`

export const statsQuery = groq`
  {
    "postsCount": count(*[_type == "post"]),
    "citiesCount": count(array::unique(*[_type == "post"].location)),
    "photosCount": count(*[_type == "post" && defined(coverImage)])
  }
`

export const allBucketItemsQuery = groq`
  *[_type == "bucketItem"] | order(_createdAt asc) {
    _id,
    title,
    description,
    location,
    lat,
    lng,
    done
  }
`

export const allGalleryImagesQuery = groq`
  *[_type == "post" && defined(coverImage)] | order(date desc) {
    _id,
    title,
    location,
    tags,
    "url": coverImage.asset->url,
    "slug": slug.current
  }
`
