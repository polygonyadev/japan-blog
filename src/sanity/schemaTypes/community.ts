import { defineField, defineType } from 'sanity'

export const communityType = defineType({
  name: 'community',
  title: 'Tipps & Fragen',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'message', title: 'Nachricht', type: 'text', rows: 4, validation: r => r.required() }),
    defineField({
      name: 'kategorie', title: 'Kategorie', type: 'string',
      options: {
        list: [
          { title: '💡 Tipp',       value: 'tipp' },
          { title: '❓ Frage',      value: 'frage' },
          { title: '💬 Allgemein',  value: 'allgemein' },
        ],
      },
    }),
    defineField({ name: 'approved', title: 'Freigegeben?', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Erstellt am', type: 'datetime' }),
    defineField({
      name: 'antworten', title: 'Antworten',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string' }),
          defineField({ name: 'message', title: 'Antwort', type: 'text', rows: 3 }),
          defineField({ name: 'createdAt', title: 'Erstellt am', type: 'datetime' }),
          defineField({ name: 'approved', title: 'Freigegeben?', type: 'boolean', initialValue: false }),
        ],
        preview: { select: { title: 'name', subtitle: 'message' } },
      }],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'message', approved: 'approved' },
    prepare({ title, subtitle, approved }) {
      return { title: `${approved ? '✅' : '⏳'} ${title}`, subtitle }
    },
  },
})
