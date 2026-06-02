import { defineField, defineType } from 'sanity'
import { uniqueCheck } from '../lib/uniqueCheck'

export const vokabelType = defineType({
  name: 'vokabel',
  title: 'Vokabel',
  type: 'document',
  fields: [
    defineField({ name: 'wort', title: 'Wort (Kanji/Kana)', type: 'string', validation: r => r.required().custom(uniqueCheck('vokabel', 'wort', 'Diese Vokabel')) }),
    defineField({ name: 'kana', title: 'Kana (Aussprache)', type: 'string' }),
    defineField({ name: 'bedeutung', title: 'Bedeutung (Deutsch)', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'wortart', title: 'Wortart', type: 'string',
      options: { list: [
        { title: 'Nomen', value: 'nomen' },
        { title: 'Verb-う', value: 'verb-u' },
        { title: 'Verb-る', value: 'verb-ru' },
        { title: 'Verb (unregelmässig)', value: 'verb-irr' },
        { title: 'い-Adjektiv', value: 'adj-i' },
        { title: 'な-Adjektiv', value: 'adj-na' },
        { title: 'Adverb', value: 'adverb' },
        { title: 'Sonstiges', value: 'sonstiges' },
      ]},
    }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'konjugation', title: 'Konjugation / Formen', type: 'array',
      description: 'z.B. Grundform, Verneinung, Vergangenheit, て-Form...',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'form', title: 'Form', type: 'string' }),
          defineField({ name: 'japanisch', title: 'Japanisch', type: 'string' }),
          defineField({ name: 'kana', title: 'Kana', type: 'string' }),
        ],
        preview: { select: { title: 'form', subtitle: 'japanisch' } },
      }],
    }),
    defineField({
      name: 'beispiele', title: 'Beispielsätze', type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'japanisch', title: 'Japanisch', type: 'string' }),
          defineField({ name: 'kana', title: 'Kana', type: 'string' }),
          defineField({ name: 'deutsch', title: 'Deutsch', type: 'string' }),
        ],
        preview: { select: { title: 'japanisch', subtitle: 'deutsch' } },
      }],
    }),
    defineField({ name: 'notizen', title: 'Notizen', type: 'text', rows: 3 }),
    defineField({
      name: 'markdown', title: 'Markdown-Inhalt (Obsidian)', type: 'text', rows: 15,
      description: 'Obsidian-Inhalt direkt einfügen — wird auf der Website gerendert',
    }),
  ],
  preview: {
    select: { title: 'wort', subtitle: 'bedeutung' },
    prepare({ title, subtitle }) { return { title, subtitle } },
  },
})
