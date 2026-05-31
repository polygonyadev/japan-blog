import { defineField, defineType } from 'sanity'

export const grammatikType = defineType({
  name: 'grammatik',
  title: 'Grammatik',
  type: 'document',
  fields: [
    defineField({ name: 'muster', title: 'Muster / Titel', type: 'string', validation: r => r.required(), description: 'z.B. 〜ながら' }),
    defineField({ name: 'bedeutung', title: 'Bedeutung (Deutsch)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'struktur', title: 'Struktur / Pattern', type: 'string', description: 'z.B. Verb (ます-Stamm) + ながら + Verb' }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'bildung', title: 'Bildung (nach Wortart)',
      type: 'array',
      description: 'Wie wird das Muster mit verschiedenen Wortarten gebildet?',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'wortart', title: 'Wortart', type: 'string', description: 'z.B. Verb-る, Nomen, い-Adj' }),
          defineField({ name: 'bildung', title: 'Bildung', type: 'string', description: 'z.B. Stamm + ながら' }),
          defineField({ name: 'beispiel', title: 'Beispiel', type: 'string' }),
        ],
        preview: { select: { title: 'wortart', subtitle: 'bildung' } },
      }],
    }),
    defineField({
      name: 'beispiele', title: 'Beispielsätze',
      type: 'array',
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
  ],
  preview: {
    select: { title: 'muster', subtitle: 'bedeutung' },
  },
})
