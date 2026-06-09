import { defineField, defineType } from 'sanity'

export const nipponSettingsType = defineType({
  name: 'nipponSettings',
  title: 'NipponOS Einstellungen',
  type: 'document',
  fields: [
    defineField({
      name: 'bannerText',
      title: 'Banner-Laufschrift (oben)',
      type: 'string',
      description: 'Der Text der oben im NipponOS durchläuft. Mit ★ kannst du Abschnitte trennen.',
      initialValue: '★ ようこそ！ Willkommen in meinem NipponOS ★ 日本大好き ★',
    }),
    defineField({
      name: 'systems',
      title: 'SYSTEMS-Anzeige (Sidebar)',
      type: 'array',
      description: 'Die lustigen Status-Zeilen links. z.B. Label "Magen", Wert "VOLL".',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'value', title: 'Wert', type: 'string' }),
          defineField({
            name: 'color', title: 'Farbe', type: 'string',
            options: { list: [
              { title: '🟢 Grün', value: 'green' },
              { title: '🩷 Pink', value: 'pink' },
              { title: '🟠 Ocker', value: 'ochre' },
              { title: '🩵 Cyan', value: 'cyan' },
            ] },
            initialValue: 'green',
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'value' } },
      }],
      initialValue: [
        { label: 'NipponOS', value: 'OK', color: 'green' },
        { label: 'Kamera', value: 'OK', color: 'green' },
        { label: 'Magen', value: 'VOLL', color: 'ochre' },
        { label: 'Heimweh', value: '12%', color: 'pink' },
      ],
    }),
  ],
  preview: { prepare() { return { title: 'NipponOS Einstellungen' } } },
})
