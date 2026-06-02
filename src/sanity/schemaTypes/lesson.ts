import { defineField, defineType } from 'sanity'
import { uniqueCheck } from '../lib/uniqueCheck'

export const lessonType = defineType({
  name: 'lesson',
  title: 'Nützliches',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: r => r.required().custom(uniqueCheck('lesson', 'title', 'Dieser Eintrag')),
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'string',
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      description: 'Ein Emoji für die Lektion, z.B. 👋 oder 🍜',
    }),
    defineField({
      name: 'jlpt',
      title: 'JLPT-Level',
      type: 'string',
      options: {
        list: [
          { title: 'N5 — Einsteiger',       value: 'N5' },
          { title: 'N4 — Grundkenntnisse',  value: 'N4' },
          { title: 'N3 — Mittelstufe',      value: 'N3' },
          { title: 'N2 — Fortgeschritten',  value: 'N2' },
          { title: 'N1 — Fliessend',        value: 'N1' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'z.B. Alltag, Essen, Reise, Begrüssung',
    }),
    defineField({
      name: 'phrases',
      title: 'Phrasen',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'jp',     title: 'Japanisch',  type: 'string', validation: r => r.required() }),
            defineField({ name: 'romaji', title: 'Romaji',     type: 'string' }),
            defineField({ name: 'de',     title: 'Deutsch',    type: 'string', validation: r => r.required() }),
          ],
          preview: {
            select: { title: 'jp', subtitle: 'de' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'jlpt' },
    prepare({ title, subtitle }) {
      return { title, subtitle: `JLPT ${subtitle}` }
    },
  },
})
