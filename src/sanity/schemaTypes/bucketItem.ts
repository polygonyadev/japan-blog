import { defineField, defineType } from 'sanity'

export const bucketItemType = defineType({
  name: 'bucketItem',
  title: 'Bucket List Eintrag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: r => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Ort',
      type: 'string',
    }),
    defineField({
      name: 'lat',
      title: 'Breitengrad (Latitude)',
      type: 'number',
    }),
    defineField({
      name: 'lng',
      title: 'Längengrad (Longitude)',
      type: 'number',
    }),
    defineField({
      name: 'done',
      title: 'Erledigt?',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', done: 'done' },
    prepare({ title, subtitle, done }) {
      return { title: `${done ? '✅' : '⬜'} ${title}`, subtitle }
    },
  },
})
