import { defineField, defineType } from 'sanity'

export const kanjiType = defineType({
  name: 'kanji',
  title: 'Kanji',
  type: 'document',
  fields: [
    defineField({ name: 'zeichen', title: 'Kanji-Zeichen', type: 'string', validation: r => r.required() }),
    defineField({ name: 'bedeutung', title: 'Bedeutung (Deutsch)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'onYomi', title: 'On-Yomi (音読み)', type: 'string', description: 'z.B. ワ, カイ' }),
    defineField({ name: 'kunYomi', title: 'Kun-Yomi (訓読み)', type: 'string', description: 'z.B. はなす, はなし' }),
    defineField({ name: 'radikal', title: 'Radikal', type: 'string', description: 'z.B. 言 (Sprechen)' }),
    defineField({ name: 'strichanzahl', title: 'Strichanzahl', type: 'number' }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'vokabeln', title: 'Vokabeln mit diesem Kanji',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'wort', title: 'Wort', type: 'string' }),
          defineField({ name: 'kana', title: 'Kana', type: 'string' }),
          defineField({ name: 'bedeutung', title: 'Bedeutung', type: 'string' }),
        ],
        preview: { select: { title: 'wort', subtitle: 'bedeutung' } },
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
    defineField({ name: 'notizen', title: 'Notizen / Aufbau / Etymologie', type: 'text', rows: 4 }),
  ],
  preview: {
    select: { title: 'zeichen', subtitle: 'bedeutung' },
  },
})
