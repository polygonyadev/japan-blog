import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: r => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: r => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Datum',
      type: 'date',
      validation: r => r.required(),
    }),
    defineField({
      name: 'location',
      title: 'Ort',
      type: 'string',
      description: 'z.B. "Tōkyō, Shinjuku"',
    }),
    defineField({
      name: 'lat',
      title: 'Breitengrad (Latitude)',
      type: 'number',
      description: 'z.B. 35.6938',
    }),
    defineField({
      name: 'lng',
      title: 'Längengrad (Longitude)',
      type: 'number',
      description: 'z.B. 139.7034',
    }),
    defineField({
      name: 'season',
      title: 'Jahreszeit',
      type: 'string',
      options: {
        list: [
          { title: '🌸 Frühling', value: 'spring' },
          { title: '☀️ Sommer',   value: 'summer' },
          { title: '🍂 Herbst',   value: 'autumn' },
          { title: '❄️ Winter',   value: 'winter' },
        ],
      },
    }),
    defineField({
      name: 'weather',
      title: 'Wetter',
      type: 'string',
      options: {
        list: [
          { title: '☀️ Sonnig',      value: 'sunny' },
          { title: '☁️ Bewölkt',     value: 'cloudy' },
          { title: '🌧️ Regnerisch', value: 'rainy' },
          { title: '❄️ Schnee',      value: 'snowy' },
          { title: '🌫️ Neblig',     value: 'foggy' },
        ],
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Kurzbeschreibung (DE)',
      type: 'text',
      rows: 3,
      description: 'Erscheint in der Post-Vorschau (Deutsch)',
      validation: r => r.required(),
    }),
    defineField({
      name: 'excerptEN',
      title: 'Kurzbeschreibung (EN)',
      type: 'text',
      rows: 3,
      description: 'Optional — English preview text',
    }),
    defineField({
      name: 'photos',
      title: 'Fotos',
      type: 'array',
      description: 'Das erste Foto wird als Vorschaubild verwendet',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'image', title: 'Foto', type: 'image', options: { hotspot: true }, validation: r => r.required() }),
          defineField({ name: 'caption', title: 'Bildunterschrift', type: 'string' }),
        ],
        preview: {
          select: { media: 'image', title: 'caption' },
          prepare({ media, title }) { return { media, title: title ?? 'Foto' } },
        },
      }],
    }),
    defineField({
      name: 'content',
      title: 'Inhalt (DE)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'contentEN',
      title: 'Inhalt (EN)',
      type: 'array',
      description: 'Optional — English content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube Video-ID',
      type: 'string',
      description: 'Nur die ID, z.B. "dQw4w9WgXcQ" aus youtube.com/watch?v=dQw4w9WgXcQ',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'photos.0.image' },
  },
})
