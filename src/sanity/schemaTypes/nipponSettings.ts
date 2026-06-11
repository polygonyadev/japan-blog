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
      name: 'stickyNote',
      title: 'Notizzettel (Desktop)',
      type: 'text',
      rows: 3,
      description: 'Erscheint als gelber Notizzettel auf dem NipponOS-Desktop (oben rechts, frei verschiebbar). Leer lassen = kein Zettel.',
    }),
    defineField({
      name: 'aboutText',
      title: 'Über mich (Text)',
      type: 'text',
      rows: 8,
      description: 'Text für die "Über mich"-App im NipponOS. Markdown möglich (## Überschrift, **fett**, - Liste). Leer lassen = Standardtext.',
    }),
    defineField({
      name: 'photoOfDay',
      title: 'Foto des Tages',
      type: 'image',
      options: { hotspot: true },
      description: 'Das Bild, das in der "Foto des Tages"-App angezeigt wird. Leer lassen = automatisch ein zufälliges Foto aus deinen Posts.',
      fields: [
        defineField({ name: 'caption', title: 'Bildunterschrift', type: 'string' }),
      ],
    }),
    defineField({
      name: 'videoOfDay',
      title: 'Video des Tages (YouTube-Link)',
      type: 'url',
      description: 'YouTube-Link oder Video-ID für die "Video des Tages"-App. z.B. https://youtu.be/abc123 oder https://www.youtube.com/watch?v=abc123',
    }),
    defineField({
      name: 'videoOfDayTitle',
      title: 'Titel des Videos (optional)',
      type: 'string',
    }),
    defineField({
      name: 'playlist',
      title: 'City-Pop Kassetten-Player (Playlist)',
      type: 'array',
      description: 'Tracks für den Kassetten-Player. Jeder Eintrag ist ein YouTube-Link.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Titel', type: 'string', validation: r => r.required() }),
          defineField({ name: 'artist', title: 'Artist', type: 'string' }),
          defineField({ name: 'youtubeUrl', title: 'YouTube-Link', type: 'url', validation: r => r.required() }),
        ],
        preview: { select: { title: 'title', subtitle: 'artist' } },
      }],
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
