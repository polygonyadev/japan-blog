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
