import { defineField, defineType } from 'sanity'
import { uniqueCheck } from '../lib/uniqueCheck'

export const notizType = defineType({
  name: 'notiz',
  title: 'Lektion',
  type: 'document',
  fields: [
    defineField({ name: 'titel', title: 'Titel', type: 'string', validation: r => r.required().custom(uniqueCheck('notiz', 'titel', 'Diese Lektion')) }),
    defineField({
      name: 'typ', title: 'Typ', type: 'string',
      options: {
        list: [
          { title: 'Vokabel',   value: 'vokabel' },
          { title: 'Kanji',     value: 'kanji' },
          { title: 'Grammatik', value: 'grammatik' },
          { title: 'Partikel',  value: 'partikel' },
          { title: 'Satz',      value: 'satz' },
          { title: 'Sonstiges', value: 'sonstiges' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'tags', title: 'Tags', type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'inhalt', title: 'Inhalt (Markdown)',
      type: 'text',
      rows: 20,
      description: 'Markdown wird auf der Website korrekt dargestellt. Obsidian-Inhalt kann direkt eingefügt werden.',
      validation: r => r.required(),
    }),
  ],
  preview: {
    select: { title: 'titel', subtitle: 'typ' },
    prepare({ title, subtitle }) {
      const emoji: Record<string, string> = { vokabel:'📝', kanji:'漢', grammatik:'🔤', partikel:'🔗', satz:'💬', sonstiges:'📋' }
      return { title, subtitle: `${emoji[subtitle] ?? '📋'} ${subtitle}` }
    },
  },
})
