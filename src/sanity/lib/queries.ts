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

export const allVokabelnQuery = groq`
  *[_type == "vokabel"] | order(jlpt asc, wort asc) {
    _id, wort, kana, bedeutung, wortart, jlpt, konjugation, beispiele, notizen, markdown
  }
`

export const allKanjiQuery = groq`
  *[_type == "kanji"] | order(jlpt asc, zeichen asc) {
    _id, zeichen, bedeutung, onYomi, kunYomi, radikal, strichanzahl, jlpt, vokabeln, beispiele, notizen, markdown
  }
`

export const allGrammatikQuery = groq`
  *[_type == "grammatik"] | order(jlpt asc, muster asc) {
    _id, muster, bedeutung, struktur, jlpt, bildung, beispiele, fehler, notizen, markdown
  }
`

export const allPartikelQuery = groq`
  *[_type == "partikel"] | order(jlpt asc, partikel asc) {
    _id, partikel, funktion, jlpt, verwendungen, fehler, notizen, markdown
  }
`

export const allSaetzeQuery = groq`
  *[_type == "satz"] | order(jlpt asc, japanisch asc) {
    _id, japanisch, kana, deutsch, jlpt, kontext, grammatik, notizen, markdown
  }
`

export const japanischSearchQuery = groq`
  {
    "vokabeln": *[_type == "vokabel" && (wort match $q || bedeutung match $q || kana match $q || markdown match $q)] {
      _id, wort, kana, bedeutung, jlpt, "typ": "vokabel"
    },
    "kanji": *[_type == "kanji" && (zeichen match $q || bedeutung match $q || onYomi match $q || kunYomi match $q || markdown match $q)] {
      _id, "wort": zeichen, "kana": onYomi, "bedeutung": bedeutung, jlpt, "typ": "kanji"
    },
    "grammatik": *[_type == "grammatik" && (muster match $q || bedeutung match $q || struktur match $q || markdown match $q)] {
      _id, "wort": muster, "kana": struktur, "bedeutung": bedeutung, jlpt, "typ": "grammatik"
    },
    "partikel": *[_type == "partikel" && (partikel match $q || funktion match $q || markdown match $q)] {
      _id, "wort": partikel, "kana": "", "bedeutung": funktion, jlpt, "typ": "partikel"
    },
    "saetze": *[_type == "satz" && (japanisch match $q || deutsch match $q || kana match $q || markdown match $q)] {
      _id, "wort": japanisch, "kana": kana, "bedeutung": deutsch, jlpt, "typ": "satz"
    },
    "lektionen": *[_type == "notiz" && (titel match $q || inhalt match $q)] {
      _id, "wort": titel, "kana": "", "bedeutung": typ, jlpt, "typ": "notiz"
    }
  }
`

export const allNotizenQuery = groq`
  *[_type == "notiz"] | order(typ asc, jlpt asc) {
    _id, titel, typ, jlpt, tags, inhalt
  }
`

export const allCommunityQuery = groq`
  *[_type == "community" && approved == true] | order(_createdAt desc) {
    _id, name, message, kategorie, createdAt,
    "antworten": antworten[approved == true]{ name, message, createdAt }
  }
`
