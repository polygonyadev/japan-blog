import { defineField, defineType } from 'sanity'

export const partikelType = defineType({
  name: 'partikel',
  title: 'Partikel',
  type: 'document',
  fields: [
    defineField({ name: 'partikel', title: 'Partikel', type: 'string', validation: r => r.required() }),
    defineField({ name: 'funktion', title: 'Funktion / Kurzbeschreibung', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'jlpt', title: 'JLPT-Level', type: 'string',
      options: { list: ['N5','N4','N3','N2','N1'].map(v => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'verwendungen', title: 'Verwendungen', type: 'array',
      of: [{
        type: 'object',
        name: 'verwendung',
        fields: [
          defineField({ name: 'titel', title: 'Verwendung / Bedeutung', type: 'string' }),
          defineField({ name: 'struktur', title: 'Struktur', type: 'string' }),
          defineField({
            name: 'beispiele', title: 'Beispiele', type: 'array',
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
        ],
        preview: { select: { title: 'titel', subtitle: 'struktur' } },
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
    select: { title: 'partikel', subtitle: 'funktion' },
  },
})
