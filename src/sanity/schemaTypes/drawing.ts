import { defineField, defineType } from 'sanity'

export const drawingType = defineType({
  name: 'drawing',
  title: 'Paint-Zeichnungen',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Gezeichnet von', type: 'string' }),
    defineField({ name: 'image', title: 'Zeichnung', type: 'image' }),
    defineField({ name: 'approved', title: 'Freigegeben?', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Erstellt am', type: 'datetime' }),
  ],
  orderings: [{ title: 'Neueste zuerst', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'name', media: 'image', approved: 'approved' },
    prepare({ title, media, approved }) {
      return { title: `${approved ? '✅' : '⏳'} ${title ?? 'Anonym'}`, media }
    },
  },
})
