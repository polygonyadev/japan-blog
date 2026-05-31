import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Website Einstellungen',
  type: 'document',
  fields: [
    defineField({
      name: 'statusText',
      title: 'Status-Text (Hero)',
      type: 'string',
      description: 'z.B. "Gerade in Tōkyō 🇯🇵" oder "Unterwegs nach Kyōto 🚅"',
      initialValue: 'Gerade in Japan 🇯🇵',
    }),
    defineField({
      name: 'showStatus',
      title: 'Status anzeigen?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'departureDate',
      title: 'Abreisedatum nach Japan',
      type: 'date',
      description: 'Tage in Japan wird automatisch ab diesem Datum berechnet',
    }),
  ],
  preview: {
    select: { title: 'statusText' },
  },
})
