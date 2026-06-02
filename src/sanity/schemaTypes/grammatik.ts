import { defineField, defineType } from 'sanity'
import { uniqueCheck } from '../lib/uniqueCheck'

export const grammatikType = defineType({
  name: 'grammatik',
  title: 'Grammatik',
  type: 'document',
  fields: [
    defineField({ name: 'muster', title: 'Muster / Titel', type: 'string', validation: r => r.required().custom(uniqueCheck('grammatik', 'muster', 'Dieses Grammatik-Muster')) }),
    defineField({ name: 'bedeutung', title: 'Bedeutung (Deutsch)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'struktur', title: 'Struktur / Pattern', type: 'string' }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'bildung', title: 'Bildung (nach Wortart)', type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'wortart', title: 'Wortart', type: 'string' }),
          defineField({ name: 'bildung', title: 'Bildung', type: 'string' }),
          defineField({ name: 'beispiel', title: 'Beispiel', type: 'string' }),
        ],
        preview: { select: { title: 'wortart', subtitle: 'bildung' } },
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
    defineField({ name: 'fehler', title: 'Häufige Fehler', type: 'text', rows: 3 }),
    defineField({ name: 'notizen', title: 'Notizen', type: 'text', rows: 3 }),
    defineField({
      name: 'markdown', title: 'Markdown-Inhalt (Obsidian)', type: 'text', rows: 15,
      description: 'Obsidian-Inhalt direkt einfügen — wird auf der Website gerendert',
    }),
  ],
  preview: {
    select: { title: 'muster', subtitle: 'bedeutung' },
  },
})
