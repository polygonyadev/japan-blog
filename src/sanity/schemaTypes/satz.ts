import { defineField, defineType } from 'sanity'

export const satzType = defineType({
  name: 'satz',
  title: 'Satz',
  type: 'document',
  fields: [
    defineField({ name: 'japanisch', title: 'Japanisch', type: 'string', validation: r => r.required() }),
    defineField({ name: 'kana', title: 'Kana (Aussprache)', type: 'string' }),
    defineField({ name: 'deutsch', title: 'Deutsch', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({ name: 'kontext', title: 'Kontext / Verwendung', type: 'string', description: 'Wann/wo wird dieser Satz verwendet?' }),
    defineField({ name: 'grammatik', title: 'Grammatikpunkte', type: 'text', rows: 2, description: 'Welche Grammatik steckt drin?' }),
    defineField({ name: 'notizen', title: 'Notizen', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { title: 'japanisch', subtitle: 'deutsch' },
  },
})
