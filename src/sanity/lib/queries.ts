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
    "coverImage": photos[0].image.asset->url,
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
    "photos": photos[]{
      "url": image.asset->url,
      caption
    }
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
  {
    "postPhotos": *[_type == "post" && defined(photos) && count(photos) > 0] | order(date desc) {
      _id,
      title,
      location,
      tags,
      "slug": slug.current,
      "images": photos[]{
        "url": image.asset->url,
        caption
      }
    },
    "standalonePhotos": *[_type == "photo"] | order(date desc) {
      _id,
      "url": image.asset->url,
      caption,
      location,
      tags
    }
  }
`

export const statsQuery = groq`
  {
    "postsCount": count(*[_type == "post"]),
    "citiesCount": count(array::unique(*[_type == "post"].location)),
    "photosCount": count(*[_type == "post"].photos[]) + count(*[_type == "photo"])
  }
`
