import { defineField, defineType } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Galerie-Foto',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
      validation: r => r.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Bildunterschrift',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Ort',
      type: 'string',
      description: 'z.B. "Tōkyō, Shinjuku"',
    }),
    defineField({
      name: 'date',
      title: 'Datum',
      type: 'date',
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
    select: { title: 'caption', subtitle: 'location', media: 'image' },
    prepare({ title, subtitle, media }) {
      return { title: title ?? 'Ohne Titel', subtitle, media }
    },
  },
})
